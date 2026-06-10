package escola.core.threads;

import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;

/**
 * =================================================================================================
 * TÓPICO 12 — THREADS (Execução em Segundo Plano)
 * =================================================================================================
 * Esta classe utiliza o framework de concorrência do Java (ExecutorService) para gerenciar 
 * múltiplas threads de execução. Threads permitem que o sistema realize tarefas pesadas 
 * (como gerar 50 relatórios) simultaneamente, sem travar o processamento principal.
 * 
 * TÓPICO 3 — ENCAPSULAMENTO
 * O 'ExecutorService' é privado, impedindo que o resto do sistema manipule as threads 
 * diretamente, garantindo segurança e ordem.
 * =================================================================================================
 */
public class ParallelExecutor {
    
    private final ExecutorService executor;
    
    // TÓPICO 9 — COLEÇÕES DO JAVA
    // Utilizamos uma ArrayList para rastrear todas as tarefas (Futures) enviadas para execução.
    private final List<Future<?>> tasks = new ArrayList<>();

    public ParallelExecutor(int poolSize) {
        // Criamos um pool fixo de threads. Se poolSize = 4, teremos 4 "trabalhadores" paralelos.
        this.executor = Executors.newFixedThreadPool(poolSize);
    }

    /**
     * Submete uma tarefa para ser executada por uma das threads do pool.
     */
    public <T> void submit(AsyncProcess<T> process) {
        tasks.add(executor.submit(process));
    }

    /**
     * Aguarda até que todas as threads terminem seu trabalho ou o tempo acabe.
     */
    public void waitForCompletion(long timeout, TimeUnit unit) throws InterruptedException {
        executor.shutdown(); // Não aceita novas tarefas
        if (!executor.awaitTermination(timeout, unit)) {
            executor.shutdownNow(); // Força o encerramento se demorar demais
        }
    }
}
