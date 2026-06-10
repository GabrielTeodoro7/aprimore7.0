package escola.dao;

import escola.model.ApiKey;
import escola.util.Config;

import java.sql.*;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public class ApiKeyDAO {
    private final String url;

    public ApiKeyDAO() throws SQLException { this(Config.get("db.url")); }
    public ApiKeyDAO(String url) throws SQLException { this.url = url; }

    private Connection conectar() throws SQLException { return DriverManager.getConnection(url); }

    public void inserir(ApiKey key) throws SQLException {
        String sql = "INSERT INTO api_keys (id, user_id, key_hash, escopo, expira_em) VALUES (?, ?, ?, ?, ?)";
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, key.getId().toString());
            ps.setString(2, key.getUserId().toString());
            ps.setString(3, key.getKeyHash());
            ps.setString(4, key.getEscopo());
            ps.setString(5, key.getExpiraEm() == null ? null : key.getExpiraEm().toString());
            ps.executeUpdate();
        }
    }

    public Optional<ApiKey> buscarPorHash(String hash) throws SQLException {
        String sql = "SELECT * FROM api_keys WHERE key_hash = ?";
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, hash);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new ApiKey(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("user_id")),
                        rs.getString("key_hash"),
                        rs.getString("escopo"),
                        rs.getString("expira_em") == null ? null : Instant.parse(rs.getString("expira_em"))
                    ));
                }
            }
        }
        return Optional.empty();
    }
}
