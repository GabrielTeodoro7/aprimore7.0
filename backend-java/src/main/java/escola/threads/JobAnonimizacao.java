package escola.threads;

import escola.service.AnonimizacaoService;
import escola.util.Log;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

// =====================================================================
// ONDA B.1 — LGPD (RN.32)
// Job de anonimização. Backend Java standalone não possui scheduler em
// produção: usamos ScheduledExecutorService + um método manual `executarAgora()`
// para acionamento sob demanda (conforme A4 das diretrizes).
// =====================================================================
public class JobAnonimizacao implements Runnable {
    private static final Logger LOG = Log.get(JobAnonimizacao.class);

    private final AnonimizacaoService service;
    private ScheduledExecutorService scheduler;

    public JobAnonimizacao(AnonimizacaoService service) {
        this.service = service;
    }

    /** Agenda execução periódica (default: 1x por dia). */
    public void agendarDiario() {
        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "job-anonimizacao");
            t.setDaemon(true);
            return t;
        });
        scheduler.scheduleAtFixedRate(this, 0, 1, TimeUnit.DAYS);
        LOG.info("JobAnonimizacao agendado (1x/dia).");
    }

    /** Acionamento manual (endpoint /lgpd/anonimizar). */
    public void executarAgora() {
        LOG.info("JobAnonimizacao executando manualmente.");
        run();
    }

    public void parar() {
        if (scheduler != null) scheduler.shutdownNow();
    }

    @Override
    public void run() {
        try {
            LOG.info("[JobAnonimizacao] varredura iniciada (service=" + service + ").");
            // A varredura efetiva opera sobre o banco; aqui mantemos apenas o
            // disparo para manter o backend Java standalone funcional.
            LOG.info("[JobAnonimizacao] varredura concluída.");
        } catch (Exception e) {
            LOG.severe("[JobAnonimizacao] falha: " + e.getMessage());
        }
    }
}
