package escola.dao;

import escola.model.Bloqueio;
import escola.util.Config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

// =============================================================================
// BloqueioContaDAO — Locks ativos de conta (RN.02).
// CONTEÚDOS ACADÊMICOS: JDBC, Optional<T>, Encapsulamento.
// =============================================================================
public class BloqueioContaDAO {
    private final String url;

    public BloqueioContaDAO() throws SQLException { this(Config.get("db.url")); }

    public BloqueioContaDAO(String url) throws SQLException {
        this.url = url;
        try (Connection c = conectar(); Statement st = c.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS bloqueios_conta (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    email TEXT NOT NULL,
                    iniciou_em TEXT NOT NULL,
                    expira_em TEXT NOT NULL,
                    tentativas INTEGER NOT NULL,
                    motivo TEXT NOT NULL,
                    liberado INTEGER NOT NULL DEFAULT 0
                )
            """);
        }
    }

    private Connection conectar() throws SQLException { return DriverManager.getConnection(url); }

    public void inserir(Bloqueio b) throws SQLException {
        try (Connection c = conectar();
             PreparedStatement ps = c.prepareStatement(
                 "INSERT INTO bloqueios_conta(id,user_id,email,iniciou_em,expira_em,tentativas,motivo,liberado)"
                 + " VALUES (?,?,?,?,?,?,?,?)")) {
            ps.setString(1, b.getId().toString());
            ps.setString(2, b.getUserId() == null ? null : b.getUserId().toString());
            ps.setString(3, b.getEmail());
            ps.setString(4, b.getIniciouEm().toString());
            ps.setString(5, b.getExpiraEm().toString());
            ps.setInt(6, b.getTentativas());
            ps.setString(7, b.getMotivo());
            ps.setInt(8, b.isLiberado() ? 1 : 0);
            ps.executeUpdate();
        }
    }

    // Retorna o bloqueio ativo (não liberado e ainda vigente) para o e-mail.
    // CONTEÚDO ACADÊMICO: uso de Optional<T> (Java 8+) — evita null.
    public Optional<Bloqueio> ativoPorEmail(String email) throws SQLException {
        try (Connection c = conectar();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT id,user_id,email,iniciou_em,expira_em,tentativas,motivo,liberado "
                 + "FROM bloqueios_conta WHERE email=? AND liberado=0 "
                 + "AND datetime(expira_em) > datetime('now') "
                 + "ORDER BY iniciou_em DESC LIMIT 1")) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new Bloqueio(
                        UUID.fromString(rs.getString("id")),
                        rs.getString("user_id") == null ? null : UUID.fromString(rs.getString("user_id")),
                        rs.getString("email"),
                        Instant.parse(rs.getString("iniciou_em")),
                        Instant.parse(rs.getString("expira_em")),
                        rs.getInt("tentativas"),
                        rs.getString("motivo"),
                        rs.getInt("liberado") == 1
                    ));
                }
                return Optional.empty();
            }
        }
    }
}
