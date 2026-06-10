package escola.dao;

import escola.model.Denuncia;
import escola.util.Config;

import java.sql.*;
import java.time.Instant;
import java.util.UUID;

// =============================================================================
// DenunciaDAO — Persistência de denúncias para moderação (RN.25).
// CONTEÚDO ACADÊMICO: JDBC, PreparedStatement.
// =============================================================================
public class DenunciaDAO {
    private final String url;

    public DenunciaDAO() throws SQLException { this(Config.get("db.url")); }
    public DenunciaDAO(String url) throws SQLException {
        this.url = url;
        try (Connection c = conectar(); Statement st = c.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS denuncias_mensagem (
                    id TEXT PRIMARY KEY,
                    mensagem_id TEXT NOT NULL,
                    denunciante_id TEXT,
                    motivo TEXT NOT NULL,
                    detalhes TEXT,
                    status TEXT DEFAULT 'PENDENTE',
                    data_denuncia TEXT,
                    moderador_id TEXT
                )
            """);
        }
    }

    private Connection conectar() throws SQLException { return DriverManager.getConnection(url); }

    public void inserir(Denuncia d) throws SQLException {
        String sql = "INSERT INTO denuncias_mensagem (id, mensagem_id, denunciante_id, motivo, detalhes, status, data_denuncia) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, d.getId().toString());
            ps.setString(2, d.getMensagemId().toString());
            ps.setString(3, d.getDenuncianteId() == null ? null : d.getDenuncianteId().toString());
            ps.setString(4, d.getMotivo());
            ps.setString(5, d.getDetalhes());
            ps.setString(6, d.getStatus().name());
            ps.setString(7, d.getDataDenuncia().toString());
            ps.executeUpdate();
        }
    }
}
