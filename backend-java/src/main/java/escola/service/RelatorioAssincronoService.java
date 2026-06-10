package escola.service;

import escola.dao.RelatorioJobDAO;
import escola.model.RelatorioJob;

import java.sql.SQLException;
import java.util.UUID;

/**
 * RN.38, 40: Processamento de relatórios pesados fora do ciclo de request.
 */
public class RelatorioAssincronoService {
    private final RelatorioJobDAO dao;

    public RelatorioAssincronoService() throws SQLException {
        this.dao = new RelatorioJobDAO();
    }

    public UUID agendarRelatorio(UUID userId, String tipo, String formato) throws SQLException {
        UUID jobId = UUID.randomUUID();
        RelatorioJob job = new RelatorioJob(jobId, userId, tipo, formato, RelatorioJob.Status.PENDENTE);
        dao.inserir(job);
        return jobId;
    }
}
