package escola.threads;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

// =============================================================================
// JobLimpezaTokens — Thread agendada para expurgo de tokens expirados.
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   Executa periodicamente uma rotina de "limpeza" — em produção,
//   removeria do banco refresh_tokens e tokens_recuperacao_senha expirados
//   ou já usados há mais de N dias. Aqui apenas loga, para fins didáticos.
//
// POR QUE FOI UTILIZADO:
//   Demonstra uso de ScheduledExecutorService (alternativa moderna a
//   Thread.sleep + while), padrão recomendado para jobs periódicos em Java.
//
// QUANDO UTILIZAR:
//   Disparado uma única vez quando o backend inicia (Main.java).
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Thread (ScheduledExecutorService — pool gerenciado).
//   - Coleções (utilizadas internamente pelo executor).
//   - Encapsulamento.
// =============================================================================
public class JobLimpezaTokens {

    private final ScheduledExecutorService scheduler =
            Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "job-limpeza-tokens");
                // Daemon=true permite que a JVM encerre sem esperar a thread.
                t.setDaemon(true);
                return t;
            });

    // Inicia o agendamento. Período padrão: a cada 1 hora.
    public void iniciar() {
        scheduler.scheduleAtFixedRate(this::executar, 0, 1, TimeUnit.HOURS);
    }

    public void parar() {
        scheduler.shutdownNow();
    }

    private void executar() {
        // Em produção: DELETE FROM refresh_tokens WHERE expira_em < now() ...
        // Aqui: apenas registra que rodou.
        System.out.println("[JobLimpezaTokens] tick @ " + java.time.Instant.now());
    }
}
