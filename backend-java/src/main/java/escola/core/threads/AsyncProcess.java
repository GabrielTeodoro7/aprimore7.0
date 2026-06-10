package escola.core.threads;

import java.util.concurrent.Callable;

/**
 * =================================================================================================
 * TÓPICO 12 — THREADS (Execução Paralela)
 * =================================================================================================
 * Esta classe representa uma tarefa que será executada em uma Thread separada.
 * Implementa a interface 'Callable' do Java, que permite que a thread retorne um resultado (T).
 * 
 * TÓPICO 6 — CLASSES ABSTRATAS
 * AsyncProcess é abstrata porque define o fluxo (início, execução, fim), mas deixa a 
 * lógica real (o método execute()) para as subclasses decidirem.
 * =================================================================================================
 */
public abstract class AsyncProcess<T> implements Callable<T> {
    
    private final String processId;
    private long startTime;

    public AsyncProcess(String processId) {
        this.processId = processId;
    }

    /**
     * O método call() é o ponto de entrada da Thread. 
     * Ele é chamado pelo ExecutorService em uma thread paralela.
     */
    @Override
    public T call() throws Exception {
        this.startTime = System.currentTimeMillis();
        
        // TÓPICO 12 — Acessando o nome da Thread atual para provar que está em paralelo.
        System.out.println("[THREAD-START] Processo: " + processId + " na Thread: " + Thread.currentThread().getName());
        
        T result = execute(); // Chama a implementação da subclasse (Polimorfismo)
        
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("[THREAD-END] Processo: " + processId + " finalizado em " + duration + "ms");
        
        return result;
    }

    /**
     * TÓPICO 8 — POLIMORFISMO
     * Cada tarefa específica (ex: Gerar Relatório, Limpar Cache) implementará este método.
     */
    protected abstract T execute() throws Exception;

    public String getProcessId() {
        return processId;
    }
}
