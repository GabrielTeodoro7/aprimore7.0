package escola.dao;

import escola.model.PreferenciaAcessibilidade;
import escola.util.Config;

import java.sql.*;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

// =============================================================================
// PreferenciaAcessibilidadeDAO — Persistência de preferências (RN.37).
// CONTEÚDO ACADÊMICO: JDBC (PreparedStatement, ResultSet), Optional.
// =============================================================================
public class PreferenciaAcessibilidadeDAO {
    private final String url;

    public PreferenciaAcessibilidadeDAO() throws SQLException { this(Config.get("db.url")); }
    public PreferenciaAcessibilidadeDAO(String url) throws SQLException {
        this.url = url;
        try (Connection c = conectar(); Statement st = c.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS preferencias_acessibilidade (
                    user_id TEXT PRIMARY KEY,
                    alto_contraste INTEGER DEFAULT 0,
                    fonte_ampliada INTEGER DEFAULT 0,
                    leitura_tela INTEGER DEFAULT 0,
                    atalhos_teclado INTEGER DEFAULT 1,
                    daltonismo_tipo TEXT,
                    ultima_sincronizacao TEXT
                )
            """);
        }
    }

    private Connection conectar() throws SQLException { return DriverManager.getConnection(url); }

    public void upsert(PreferenciaAcessibilidade p) throws SQLException {
        String sql = """
            INSERT INTO preferencias_acessibilidade(user_id, alto_contraste, fonte_ampliada, leitura_tela, atalhos_teclado, daltonismo_tipo, ultima_sincronizacao)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                alto_contraste = excluded.alto_contraste,
                fonte_ampliada = excluded.fonte_ampliada,
                leitura_tela = excluded.leitura_tela,
                atalhos_teclado = excluded.atalhos_teclado,
                daltonismo_tipo = excluded.daltonismo_tipo,
                ultima_sincronizacao = excluded.ultima_sincronizacao
        """;
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, p.getUserId().toString());
            ps.setInt(2, p.isAltoContraste() ? 1 : 0);
            ps.setInt(3, p.isFonteAmpliada() ? 1 : 0);
            ps.setInt(4, p.isLeituraTela() ? 1 : 0);
            ps.setInt(5, p.isAtalhosTeclado() ? 1 : 0);
            ps.setString(6, p.getDaltonismoTipo().name());
            ps.setString(7, p.getUltimaSincronizacao().toString());
            ps.executeUpdate();
        }
    }

    public Optional<PreferenciaAcessibilidade> buscarPorUsuario(UUID userId) throws SQLException {
        String sql = "SELECT * FROM preferencias_acessibilidade WHERE user_id = ?";
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, userId.toString());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new PreferenciaAcessibilidade(
                        UUID.fromString(rs.getString("user_id")),
                        rs.getInt("alto_contraste") == 1,
                        rs.getInt("fonte_ampliada") == 1,
                        rs.getInt("leitura_tela") == 1,
                        rs.getInt("atalhos_teclado") == 1,
                        PreferenciaAcessibilidade.Daltonismo.valueOf(rs.getString("daltonismo_tipo")),
                        Instant.parse(rs.getString("ultima_sincronizacao"))
                    ));
                }
            }
        }
        return Optional.empty();
    }
}
