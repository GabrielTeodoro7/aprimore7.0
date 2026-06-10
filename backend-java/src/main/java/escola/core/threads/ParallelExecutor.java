package escola.core.threads;

import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;

/**
 * [THREAD POOL / EXECUTOR SERVICE]
 * Gerenciador de execução paralela utilizando pools de threads fixos.
 */
public class ParallelExecutor {
    private final ExecutorService executor;
    private final List<Future<?>> tasks = new ArrayList<>();

    public ParallelExecutor(int poolSize) {
        // [ENCAPSULAMENTO] O ExecutorService é interno e protegido
        this.executor = Executors.newFixedThreadPool(poolSize);
    }

    public <T> void submit(AsyncProcess<T> process) {
        tasks.add(executor.submit(process));
    }

    public void waitForCompletion(long timeout, TimeUnit unit) throws InterruptedException {
        executor.shutdown();
        if (!executor.awaitTermination(timeout, unit)) {
            executor.shutdownNow();
        }
    }
}
