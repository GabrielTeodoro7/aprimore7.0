package escola.dao;

import escola.model.RelatorioJob;
import escola.util.Config;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RelatorioJobDAO {
    private final String url;

    public RelatorioJobDAO() throws SQLException { this(Config.get("db.url")); }
    public RelatorioJobDAO(String url) throws SQLException { this.url = url; }

    private Connection conectar() throws SQLException { return DriverManager.getConnection(url); }

    public void inserir(RelatorioJob job) throws SQLException {
        String sql = "INSERT INTO relatorios_jobs (id, user_id, tipo_relatorio, formato, status) VALUES (?, ?, ?, ?, ?)";
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, job.getId().toString());
            ps.setString(2, job.getUserId().toString());
            ps.setString(3, job.getTipoRelatorio());
            ps.setString(4, job.getFormato());
            ps.setString(5, job.getStatus().name());
            ps.executeUpdate();
        }
    }

    public List<RelatorioJob> listarPendentes() throws SQLException {
        List<RelatorioJob> jobs = new ArrayList<>();
        String sql = "SELECT * FROM relatorios_jobs WHERE status = 'PENDENTE' LIMIT 10";
        try (Connection c = conectar(); Statement st = c.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                jobs.add(new RelatorioJob(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("user_id")),
                    rs.getString("tipo_relatorio"),
                    rs.getString("formato"),
                    RelatorioJob.Status.valueOf(rs.getString("status"))
                ));
            }
        }
        return jobs;
    }

    public void atualizarStatus(UUID id, RelatorioJob.Status status, String url) throws SQLException {
        String sql = "UPDATE relatorios_jobs SET status = ?, arquivo_url = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setString(2, url);
            ps.setString(3, id.toString());
            ps.executeUpdate();
        }
    }
}
