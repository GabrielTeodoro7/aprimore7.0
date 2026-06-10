package escola.tutorial;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * [O QUE] JDBC
 * [POR QUE] Salvar heróis em um Banco de Dados de verdade (SQLite).
 * [CONTEÚDO] JDBC
 */
public class HeroDAO {
    private static final String URL = "jdbc:sqlite:escola.db";

    public void init() {
        try (Connection conn = DriverManager.getConnection(URL)) {
            Statement stmt = conn.createStatement();
            // Cria tabela de heróis se não existir
            stmt.execute("CREATE TABLE IF NOT EXISTS heroes_tutorial (" +
                         "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                         "name TEXT NOT NULL," +
                         "power_level INTEGER)");
            System.out.println("Tabela de heróis pronta no Banco de Dados!");
        } catch (SQLException e) {
            System.err.println("Erro JDBC: " + e.getMessage());
        }
    }

    public void saveHero(String name, int level) {
        String sql = "INSERT INTO heroes_tutorial(name, power_level) VALUES(?, ?)";
        try (Connection conn = DriverManager.getConnection(URL);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setInt(2, level);
            pstmt.executeUpdate();
            System.out.println("Herói " + name + " salvo no Banco!");
        } catch (SQLException e) {
            System.err.println("Erro ao salvar herói: " + e.getMessage());
        }
    }
}
