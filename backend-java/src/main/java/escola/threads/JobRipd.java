package escola.threads;

import escola.service.RipdService;
import escola.util.Log;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

// =====================================================================
// ONDA B.1 — LGPD (RN.46)
// Job de geração do RIPD trimestral. Backend Java standalone usa
// ScheduledExecutorService + acionamento manual `executarAgora()`.
// =====================================================================
public class JobRipd implements Runnable {
    private static final Logger LOG = Log.get(JobRipd.class);

    private final RipdService service;
    private ScheduledExecutorService scheduler;

    public JobRipd(RipdService service) {
        this.service = service;
    }

    /** Agenda execução periódica (default: 1x por semana — granularidade segura). */
    public void agendarSemanal() {
        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "job-ripd");
            t.setDaemon(true);
            return t;
        });
        scheduler.scheduleAtFixedRate(this, 0, 7, TimeUnit.DAYS);
        LOG.info("JobRipd agendado (1x/semana).");
    }

    /** Acionamento manual (endpoint /ripd/gerar). */
    public Map<String, Object> executarAgora() {
        LOG.info("JobRipd executando manualmente.");
        LocalDate hoje = LocalDate.now();
        int trimestre = service.trimestreDe(hoje);
        return service.agregarTrimestre(hoje.getYear(), trimestre, 0, 0, 0, 0, 0);
    }

    public void parar() {
        if (scheduler != null) scheduler.shutdownNow();
    }

    @Override
    public void run() {
        try {
            executarAgora();
        } catch (Exception e) {
            LOG.severe("[JobRipd] falha: " + e.getMessage());
        }
    }
}
