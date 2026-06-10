package escola.threads;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * O QUE: Job para verificar metas de PDI vencidas.
 * POR QUE: Atender RN.22 (Alerta de meta vencida) de forma automatizada.
 * CONTEÚDO ACADÊMICO: Threads, ScheduledExecutorService.
 */
public class JobAlertaMetas {
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public void iniciar() {
        // Executa a cada 24 horas
        scheduler.scheduleAtFixedRate(() -> {
            System.out.println("[JOB] Verificando metas PDI vencidas (RN.22)...");
            // Aqui entraria a lógica de buscar metas no DB e enviar notificações
        }, 0, 1, TimeUnit.DAYS);
    }

    public void parar() {
        scheduler.shutdown();
    }
}
