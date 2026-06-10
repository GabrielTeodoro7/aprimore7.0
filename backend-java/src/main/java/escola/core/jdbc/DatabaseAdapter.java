package escola.core.jdbc;

import java.sql.*;
import java.util.Optional;

/**
 * =================================================================================================
 * TÓPICO 14 — JDBC (Java Database Connectivity)
 * =================================================================================================
 * O JDBC é a ponte oficial do Java para bancos de dados relacionais. 
 * Esta classe 'DatabaseAdapter' centraliza a conexão com o banco de dados (neste caso, SQLite).
 * 
 * TÓPICO 11 — EXCEÇÕES DO JAVA (Exception Handling)
 * Todo acesso a banco de dados pode falhar (conexão perdida, SQL errado), por isso 
 * o uso de blocos try-catch e a declaração 'throws SQLException' é obrigatório e crucial.
 * =================================================================================================
 */
public abstract class DatabaseAdapter {
    
    // URL de conexão para o banco SQLite local
    protected static final String URL = "jdbc:sqlite:escola.db";

    static {
        try {
            // [JDBC] Carregamento dinâmico do Driver do SQLite.
            // Se o driver não estiver no classpath, uma ClassNotFoundException será lançada.
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("ERRO CRÍTICO: Driver JDBC do SQLite não encontrado!", e);
        }
    }

    /**
     * Obtém uma conexão ativa com o banco de dados.
     * @return Objeto Connection do JDBC
     */
    protected Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL);
    }

    /**
     * TÓPICO 11 — TRATAMENTO DE EXCEÇÕES
     * Método utilitário para fechar recursos (Connection, Statement, ResultSet) 
     * com segurança, evitando vazamentos de memória (Memory Leaks).
     */
    protected void close(AutoCloseable... resources) {
        for (AutoCloseable res : resources) {
            if (res != null) {
                try {
                    res.close(); // Tenta fechar o recurso
                } catch (Exception e) {
                    // Erro ao fechar? Apenas logamos, pois o recurso já pode estar fechado.
                    System.err.println("Erro ao fechar recurso JDBC: " + e.getMessage());
                }
            }
        }
    }
}
