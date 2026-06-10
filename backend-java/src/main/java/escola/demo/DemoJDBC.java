package escola.demo;

// JDBC = Java Database Connectivity. Pacote padrão java.sql.*.
// Permite que qualquer programa Java converse com bancos relacionais
// (SQLite, PostgreSQL, MySQL, Oracle...) usando a mesma API.
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import escola.util.Config;

// =============================================================================
// TÓPICO 14 — JDBC (exemplo standalone, didático)
// =============================================================================
// O que esta classe faz:
//   Demonstra, em um único arquivo, o ciclo completo de uso do JDBC:
//   conectar → criar tabela → inserir → consultar → atualizar → remover.
//   É independente do AlunoDAO do sistema (que também usa JDBC).
//
// Por que foi utilizada:
//   O requisito acadêmico pede um "exemplo funcional de acesso ao banco
//   utilizando JDBC, devidamente documentado". Mantemos o AlunoDAO real
//   intacto e adicionamos este arquivo apenas para fins pedagógicos.
//
// Qual conceito de Java está sendo aplicado:
//   - JDBC (Connection, Statement, PreparedStatement, ResultSet).
//   - Exceções verificadas (SQLException) e try-with-resources.
//   - Strings parametrizadas (proteção contra SQL Injection).
//
// Quando utilizar esse conceito em outros projetos:
//   Em qualquer projeto Java que precise persistir dados em um banco
//   relacional sem usar um ORM (Hibernate/JPA). É a base de qualquer ORM.
//
// Como funciona internamente:
//   - DriverManager.getConnection() localiza o driver registrado (o SQLite
//     JDBC, neste caso) e abre uma conexão TCP/arquivo com o banco.
//   - PreparedStatement compila a query no servidor uma vez e reaproveita
//     o plano de execução para cada execução, além de escapar parâmetros.
//   - ResultSet é um cursor que aponta para a linha atual; rs.next() avança.
// =============================================================================
public class DemoJDBC {

    public static void main(String[] args) {
        // URL JDBC: identifica o driver e o destino. Para SQLite é "jdbc:sqlite:<arquivo>".
        String url = Config.get("db.url");

        // try-with-resources: a Connection implementa AutoCloseable, então o
        // bloco try cuida do close() automaticamente — evitamos vazamento de recurso.
        try (Connection conn = DriverManager.getConnection(url)) {

            System.out.println("[JDBC-DEMO] Conectado em: " + url);

            // ----- 1) DDL: criar uma tabela auxiliar exclusiva para a demo. -----
            // Statement é usado para SQL sem parâmetros (CREATE/DROP, etc).
            try (Statement st = conn.createStatement()) {
                st.execute("""
                    CREATE TABLE IF NOT EXISTS demo_jdbc (
                        id    INTEGER PRIMARY KEY AUTOINCREMENT,
                        chave TEXT    NOT NULL UNIQUE,
                        valor TEXT    NOT NULL
                    )
                """);
                // Limpa a tabela a cada execução para a demo ficar previsível.
                st.execute("DELETE FROM demo_jdbc");
            }

            // ----- 2) INSERT com PreparedStatement (parâmetros) ----------------
            // PreparedStatement evita SQL Injection: os "?" são substituídos
            // pelos valores via setString/setInt no driver, não na string.
            String insert = "INSERT INTO demo_jdbc(chave, valor) VALUES (?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(insert)) {
                ps.setString(1, "ambiente");
                ps.setString(2, "academico");
                ps.executeUpdate();

                ps.setString(1, "versao");
                ps.setString(2, "1.0.0");
                ps.executeUpdate();
            }

            // ----- 3) SELECT + ResultSet --------------------------------------
            String select = "SELECT id, chave, valor FROM demo_jdbc";
            try (PreparedStatement ps = conn.prepareStatement(select);
                 ResultSet rs = ps.executeQuery()) {
                System.out.println("[JDBC-DEMO] Linhas inseridas:");
                while (rs.next()) {
                    System.out.printf("  id=%d  %s = %s%n",
                            rs.getInt("id"),
                            rs.getString("chave"),
                            rs.getString("valor"));
                }
            }

            // ----- 4) UPDATE parametrizado ------------------------------------
            String update = "UPDATE demo_jdbc SET valor = ? WHERE chave = ?";
            try (PreparedStatement ps = conn.prepareStatement(update)) {
                ps.setString(1, "1.0.1");
                ps.setString(2, "versao");
                int afetadas = ps.executeUpdate();
                System.out.println("[JDBC-DEMO] UPDATE afetou " + afetadas + " linha(s).");
            }

            // ----- 5) DELETE parametrizado ------------------------------------
            String delete = "DELETE FROM demo_jdbc WHERE chave = ?";
            try (PreparedStatement ps = conn.prepareStatement(delete)) {
                ps.setString(1, "ambiente");
                int afetadas = ps.executeUpdate();
                System.out.println("[JDBC-DEMO] DELETE afetou " + afetadas + " linha(s).");
            }

            System.out.println("[JDBC-DEMO] Concluído com sucesso.");

        } catch (SQLException e) {
            // Exceções: SQLException é checked, o compilador obriga tratar.
            // Em projetos reais, traduziríamos para uma exceção de negócio.
            System.err.println("[JDBC-DEMO] Erro de JDBC: " + e.getMessage());
        }
    }
}
