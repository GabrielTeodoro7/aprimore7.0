package escola.dao;

import escola.model.TentativaLogin;
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
// TentativaLoginDAO — Persistência das tentativas (RN.02 / RN.61).
// CONTEÚDOS ACADÊMICOS: JDBC + Coleções + Enum (Motivo).
// =============================================================================
public class TentativaLoginDAO {
    private final String url;

    public TentativaLoginDAO() throws SQLException { this(Config.get("db.url")); }

    public TentativaLoginDAO(String url) throws SQLException {
        this.url = url;
        try (Connection c = conectar(); Statement st = c.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS tentativas_login (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL,
                    user_id TEXT,
                    sucesso INTEGER NOT NULL,
                    ip TEXT,
                    user_agent TEXT,
                    motivo TEXT,
                    created_at TEXT NOT NULL
                )
            """);
        }
    }

    private Connection conectar() throws SQLException { return DriverManager.getConnection(url); }

    public void inserir(TentativaLogin t) throws SQLException {
        try (Connection c = conectar();
             PreparedStatement ps = c.prepareStatement(
                 "INSERT INTO tentativas_login(id,email,user_id,sucesso,ip,user_agent,motivo,created_at)"
                 + " VALUES (?,?,?,?,?,?,?,?)")) {
            ps.setString(1, t.getId().toString());
            ps.setString(2, t.getEmail());
            ps.setString(3, t.getUserId() == null ? null : t.getUserId().toString());
            ps.setInt(4, t.isSucesso() ? 1 : 0);
            ps.setString(5, t.getIp());
            ps.setString(6, t.getUserAgent());
            ps.setString(7, t.getMotivo().name());
            ps.setString(8, t.getCriadoEm().toString());
            ps.executeUpdate();
        }
    }

    // Conta tentativas FRACASSADAS recentes (dentro da janela em minutos).
    // CONTEÚDO ACADÊMICO: agregação SQL com COUNT + datas.
    public int contarFalhasRecentes(String email, int janelaMinutos) throws SQLException {
        try (Connection c = conectar();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT COUNT(*) FROM tentativas_login "
                 + "WHERE email=? AND sucesso=0 "
                 + "AND datetime(created_at) >= datetime('now', ?)")) {
            ps.setString(1, email);
            ps.setString(2, "-" + janelaMinutos + " minutes");
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    public List<TentativaLogin> listarUltimas(String email, int n) throws SQLException {
        List<TentativaLogin> out = new ArrayList<>();
        try (Connection c = conectar();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT id,email,user_id,sucesso,ip,user_agent,motivo,created_at "
                 + "FROM tentativas_login WHERE email=? "
                 + "ORDER BY created_at DESC LIMIT ?")) {
            ps.setString(1, email);
            ps.setInt(2, n);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(new TentativaLogin(
                        UUID.fromString(rs.getString("id")),
                        rs.getString("email"),
                        rs.getString("user_id") == null ? null : UUID.fromString(rs.getString("user_id")),
                        rs.getInt("sucesso") == 1,
                        rs.getString("ip"),
                        rs.getString("user_agent"),
                        TentativaLogin.Motivo.valueOf(rs.getString("motivo")),
                        Instant.parse(rs.getString("created_at"))
                    ));
                }
            }
        }
        return out;
    }
}
