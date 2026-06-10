package escola.core.threads;

import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * [THREADS / CONCURRENCY]
 * Representa um processo assíncrono de alto nível.
 * Utiliza Generics para flexibilidade de retorno.
 */
public abstract class AsyncProcess<T> implements Callable<T> {
    private final String processId;
    private long startTime;

    public AsyncProcess(String processId) {
        this.processId = processId;
    }

    // Template Method Pattern
    @Override
    public T call() throws Exception {
        this.startTime = System.currentTimeMillis();
        System.out.println("[THREAD-START] Processo: " + processId + " em execução na Thread: " + Thread.currentThread().getName());
        
        T result = execute();
        
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("[THREAD-END] Processo: " + processId + " finalizado em " + duration + "ms");
        return result;
    }

    protected abstract T execute() throws Exception;

    public String getProcessId() {
        return processId;
    }
}
