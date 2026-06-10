package escola.core;

import escola.core.threads.ParallelExecutor;
import escola.core.threads.AsyncProcess;
import escola.core.io.FileManager;
import escola.core.jdbc.DatabaseAdapter;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * [O SISTEMA ROBUSTO]
 * Classe principal que orquestra os componentes do 'core'.
 * Demonstra a integração de Threads, JDBC, IO e Coleções de forma profissional.
 */
public class CoreEngine extends DatabaseAdapter {

    public void runSystem() {
        System.out.println("\n--- INICIALIZANDO CORE ENGINE (MODO AVANÇADO) ---");

        // 1. Gerenciador de Threads
        ParallelExecutor pool = new ParallelExecutor(4);

        // 2. Definindo um processo assíncrono (Polimorfismo de classe abstrata)
        AsyncProcess<String> dataTask = new AsyncProcess<>("DATA-SYNC-01") {
            @Override
            protected String execute() throws Exception {
                // Simula processamento pesado
                Thread.sleep(1500);
                return "Sincronização concluída com o Banco de Dados.";
            }
        };

        // 3. Execução
        pool.submit(dataTask);

        // 4. Exemplo de JDBC integrado
        try {
            initDatabase();
        } catch (Exception e) {
            System.err.println("Erro Crítico no JDBC: " + e.getMessage());
        }

        // 5. Finalização
        try {
            pool.waitForCompletion(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("--- CORE ENGINE FINALIZADO ---");
    }

    private void initDatabase() throws Exception {
        try (var conn = getConnection()) {
            System.out.println("[JDBC] Conexão ativa com o banco central.");
        }
    }

    public static void main(String[] args) {
        new CoreEngine().runSystem();
    }
}
