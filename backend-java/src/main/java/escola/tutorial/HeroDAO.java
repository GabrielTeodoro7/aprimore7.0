package escola.tutorial;

import java.sql.*;

/**
 * [TÓPICO 14: JDBC - Java Database Connectivity]
 * JDBC é a ponte que liga o Java ao Banco de Dados.
 * Sem isso, quando você desliga o PC, o herói some da memória!
 */
public class HeroDAO {
    // Endereço do arquivo do banco de dados (SQLite)
    private static final String URL = "jdbc:sqlite:escola.db";

    /**
     * [INICIALIZANDO O BANCO]
     * Usamos 'Connection', 'Statement' e 'SQLException'.
     */
    public void init() {
        // try-with-resources: fecha a conexão sozinho para não gastar energia!
        try (Connection conn = DriverManager.getConnection(URL)) {
            Statement stmt = conn.createStatement();
            
            // Comando SQL para criar a "gaveta" (tabela) dos heróis
            stmt.execute("CREATE TABLE IF NOT EXISTS heroes_tutorial (" +
                         "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                         "name TEXT NOT NULL," +
                         "power_level INTEGER)");
            
            System.out.println("[JDBC] Tabela de Heróis verificada com sucesso!");
        } catch (SQLException e) {
            System.err.println("[JDBC-ERRO] Falha ao conectar: " + e.getMessage());
        }
    }

    /**
     * [SALVANDO DADOS]
     * Usamos 'PreparedStatement' para evitar que vilões (hackers) estraguem o banco.
     */
    public void saveHero(String name, int level) {
        String sql = "INSERT INTO heroes_tutorial(name, power_level) VALUES(?, ?)";
        
        try (Connection conn = DriverManager.getConnection(URL);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            // Trocamos as '?' pelos valores reais de forma segura
            pstmt.setString(1, name);
            pstmt.setInt(2, level);
            
            pstmt.executeUpdate(); // Manda o comando pro Banco!
            System.out.println("[JDBC] Herói '" + name + "' guardado para sempre!");
            
        } catch (SQLException e) {
            System.err.println("[JDBC-ERRO] Não consegui salvar o herói: " + e.getMessage());
        }
    }
}

