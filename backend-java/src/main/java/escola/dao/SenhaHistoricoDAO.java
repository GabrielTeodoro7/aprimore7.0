package escola.dao;

import escola.model.Senha;
import escola.util.Config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

// =============================================================================
// SenhaHistoricoDAO — JDBC para histórico de senhas (RN.01).
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   Persiste e lê hashes PBKDF2 das senhas anteriores do usuário, para
//   impedir reutilização das últimas N.
//
// POR QUE FOI UTILIZADO:
//   Demonstra acesso JDBC com PreparedStatement (anti-SQL-injection) e
//   o padrão DAO (uma classe por entidade).
//
// QUANDO UTILIZAR:
//   Em SenhaService antes de aceitar a troca de senha.
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - JDBC (Connection, PreparedStatement, ResultSet).
//   - Coleções (ArrayList).
//   - Exceções checadas (SQLException).
//   - Encapsulamento.
// =============================================================================
public class SenhaHistoricoDAO {

    private final String url;

    public SenhaHistoricoDAO() throws SQLException {
        this(Config.get("db.url"));
    }

    public SenhaHistoricoDAO(String url) throws SQLException {
        this.url = url;
        try (Connection c = conectar(); Statement st = c.createStatement()) {
            // Tabela espelho para uso local no SQLite (acadêmico).
            // Em produção o registro real fica no Postgres/Supabase.
            st.execute("""
                CREATE TABLE IF NOT EXISTS senha_historico (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    hash TEXT NOT NULL,
                    algoritmo TEXT NOT NULL DEFAULT 'PBKDF2WithHmacSHA256',
                    iteracoes INTEGER NOT NULL DEFAULT 200000,
                    created_at TEXT NOT NULL
                )
            """);
        }
    }

    private Connection conectar() throws SQLException {
        return DriverManager.getConnection(url);
    }

    // Insere um novo hash no histórico.
    public void inserir(Senha s) throws SQLException {
        try (Connection c = conectar();
             PreparedStatement ps = c.prepareStatement(
                 "INSERT INTO senha_historico (id, user_id, hash, algoritmo, iteracoes, created_at) "
                 + "VALUES (?,?,?,?,?,?)")) {
            ps.setString(1, s.getId().toString());
            ps.setString(2, s.getUserId().toString());
            ps.setString(3, s.getHash());
            ps.setString(4, s.getAlgoritmo());
            ps.setInt(5, s.getIteracoes());
            ps.setString(6, s.getCriadoEm().toString());
            ps.executeUpdate();
        }
    }

    // Lista as últimas N senhas do usuário (mais recentes primeiro).
    // CONTEÚDO ACADÊMICO: Coleções (List/ArrayList), iteração de ResultSet.
    public List<Senha> ultimas(UUID userId, int n) throws SQLException {
        List<Senha> out = new ArrayList<>();
        try (Connection c = conectar();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT id, user_id, hash, algoritmo, iteracoes, created_at "
                 + "FROM senha_historico WHERE user_id=? "
                 + "ORDER BY created_at DESC LIMIT ?")) {
            ps.setString(1, userId.toString());
            ps.setInt(2, n);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(new Senha(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("user_id")),
                        rs.getString("hash"),
                        rs.getString("algoritmo"),
                        rs.getInt("iteracoes"),
                        Instant.parse(rs.getString("created_at"))
                    ));
                }
            }
        }
        return out;
    }
}
