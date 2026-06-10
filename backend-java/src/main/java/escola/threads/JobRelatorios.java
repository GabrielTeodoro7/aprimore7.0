package escola.threads;

import escola.dao.RelatorioJobDAO;
import escola.model.RelatorioJob;

import java.util.List;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

/**
 * JobRelatorios — Processa a fila de relatórios assíncronos (RN.38).
 * CONTEÚDO ACADÊMICO: Threads, ScheduledExecutorService.
 */
public class JobRelatorios implements Runnable {
    private static final Logger logger = Logger.getLogger(JobRelatorios.class.getName());
    private final RelatorioJobDAO dao;

    public JobRelatorios(RelatorioJobDAO dao) {
        this.dao = dao;
    }

    public static void agendar(ScheduledExecutorService executor, RelatorioJobDAO dao) {
        executor.scheduleAtFixedRate(new JobRelatorios(dao), 0, 30, TimeUnit.SECONDS);
    }

    @Override
    public void run() {
        try {
            List<RelatorioJob> pendentes = dao.listarPendentes();
            for (RelatorioJob job : pendentes) {
                logger.info("Processando relatório assíncrono: " + job.getId());
                dao.atualizarStatus(job.getId(), RelatorioJob.Status.PROCESSANDO, null);
                
                // Simulação de processamento pesado
                Thread.sleep(2000);
                
                String fakeUrl = "https://cdn.escola.com/relatorios/" + job.getId() + "." + job.getFormato().toLowerCase();
                dao.atualizarStatus(job.getId(), RelatorioJob.Status.CONCLUIDO, fakeUrl);
            }
        } catch (Exception e) {
            logger.severe("Erro no JobRelatorios: " + e.getMessage());
        }
    }
}
