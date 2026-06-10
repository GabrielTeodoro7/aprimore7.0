package escola.core.jdbc;

import java.sql.*;
import java.util.Optional;

/**
 * [JDBC / ABSTRAÇÃO]
 * Camada base para persistência de dados utilizando Singleton e Factory patterns.
 */
public abstract class DatabaseAdapter {
    protected static final String URL = "jdbc:sqlite:escola.db";

    static {
        try {
            // [JDBC] Forçando o carregamento do driver
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Driver JDBC não encontrado!", e);
        }
    }

    protected Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL);
    }

    /**
     * [TRATAMENTO DE EXCEÇÕES]
     * Centraliza a lógica de fechamento de recursos.
     */
    protected void close(AutoCloseable... resources) {
        for (AutoCloseable res : resources) {
            if (res != null) {
                try {
                    res.close();
                } catch (Exception e) {
                    System.err.println("Erro ao fechar recurso JDBC: " + e.getMessage());
                }
            }
        }
    }
}
