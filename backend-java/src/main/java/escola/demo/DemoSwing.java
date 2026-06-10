package escola.demo;

// Imports do pacote Java Swing — biblioteca padrão de GUI desktop do Java.
// Swing faz parte do JDK (javax.swing.*), não precisa de dependência externa.
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import escola.util.Config;

// =============================================================================
// TÓPICO 13 — JAVA SWING (tela demonstrativa, separada do sistema principal)
// =============================================================================
// O que esta classe faz:
//   Abre uma janela desktop (JFrame) que lista os alunos cadastrados no banco
//   SQLite via JDBC e permite atualizar a lista clicando em um botão.
//
// Por que foi utilizada:
//   O requisito acadêmico exige evidenciar o conteúdo "Java Swing" do bimestre
//   em uma tela simples, sem prejudicar o sistema principal. Por isso ela vive
//   em um pacote separado (escola.demo) e é executada manualmente pelo aluno
//   com `mvn exec:java -Dexec.mainClass=escola.demo.DemoSwing` ou pelo IDE.
//
// Qual conceito de Java está sendo aplicado:
//   - Java Swing (JFrame, JPanel, JButton, JTable, JScrollPane).
//   - Tratamento de eventos com ActionListener (interface funcional).
//   - JDBC (reaproveitado aqui para popular a tabela).
//   - Coleções (List/ArrayList) para armazenar as linhas lidas do banco.
//
// Quando utilizar esse conceito em outros projetos:
//   Sempre que precisar de uma interface desktop simples (ferramentas internas,
//   protótipos, utilitários administrativos) sem rodar um navegador web.
//
// Como funciona internamente:
//   Swing roda na EDT (Event Dispatch Thread). Por isso a janela é criada
//   dentro de SwingUtilities.invokeLater(...): isso garante que toda a
//   construção da UI ocorra na thread correta, evitando travamentos.
// =============================================================================
public class DemoSwing {

    // Método main: ponto de entrada quando esta classe é executada como app.
    public static void main(String[] args) {
        // invokeLater agenda a execução do código no Event Dispatch Thread (EDT).
        // Regra de ouro do Swing: TODO componente gráfico deve ser criado/alterado
        // na EDT, nunca na thread main, para evitar problemas de concorrência.
        SwingUtilities.invokeLater(DemoSwing::criarJanela);
    }

    // Método privado: encapsulamento — quem usa esta classe só enxerga main().
    private static void criarJanela() {
        // JFrame: a janela principal do Swing. Equivalente a uma "tela" do app.
        JFrame frame = new JFrame("Demo Swing — Lista de Alunos (acadêmico)");
        // EXIT_ON_CLOSE encerra a JVM ao fechar a janela.
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(600, 400);
        // BorderLayout divide a janela em regiões (NORTH, CENTER, SOUTH...).
        frame.setLayout(new BorderLayout());

        // JTable: componente que exibe dados em forma de tabela (linhas/colunas).
        String[] colunas = {"Matrícula", "Nome", "CPF", "Nota Média"};
        // DefaultTableModel é o "modelo" que alimenta a JTable (padrão MVC do Swing).
        javax.swing.table.DefaultTableModel modelo =
                new javax.swing.table.DefaultTableModel(colunas, 0);
        JTable tabela = new JTable(modelo);
        // JScrollPane adiciona barras de rolagem automaticamente.
        frame.add(new JScrollPane(tabela), BorderLayout.CENTER);

        // JButton: botão clicável. Vamos associar um ActionListener para recarregar.
        JButton btnRecarregar = new JButton("Recarregar do banco (JDBC)");
        // ActionListener é uma interface funcional → podemos passar lambda.
        // Esse é também um exemplo de Polimorfismo (objeto-função tratado como evento).
        btnRecarregar.addActionListener((ActionEvent e) -> recarregar(modelo));
        JPanel rodape = new JPanel();
        rodape.add(btnRecarregar);
        frame.add(rodape, BorderLayout.SOUTH);

        // Carrega os dados imediatamente ao abrir.
        recarregar(modelo);

        // setVisible(true) exibe a janela. Antes disso ela existe apenas na memória.
        frame.setLocationRelativeTo(null); // centraliza na tela
        frame.setVisible(true);
    }

    // Lê os alunos do banco SQLite (via JDBC) e injeta no modelo da tabela.
    // Tópicos aplicados: JDBC, Coleções, Exceções.
    private static void recarregar(javax.swing.table.DefaultTableModel modelo) {
        // Limpa as linhas atuais antes de recarregar.
        modelo.setRowCount(0);

        // List<Object[]> é uma Coleção do Java (java.util.List) usada para
        // armazenar temporariamente as linhas lidas do banco.
        List<Object[]> linhas = new ArrayList<>();

        // try-with-resources: garante que Connection/Statement/ResultSet sejam
        // fechados automaticamente, mesmo se uma exceção for lançada.
        try (Connection c = DriverManager.getConnection(Config.get("db.url"));
             Statement st = c.createStatement();
             ResultSet rs = st.executeQuery(
                     "SELECT matricula, nome, cpf, nota_media FROM alunos")) {

            // while + rs.next(): percorre cada linha retornada pela consulta.
            while (rs.next()) {
                linhas.add(new Object[]{
                        rs.getString("matricula"),
                        rs.getString("nome"),
                        rs.getString("cpf"),
                        rs.getDouble("nota_media")
                });
            }
        } catch (Exception ex) {
            // Exceções: capturamos qualquer falha de JDBC e mostramos um diálogo
            // amigável ao usuário em vez de derrubar a aplicação.
            JOptionPane.showMessageDialog(null,
                    "Falha ao ler banco: " + ex.getMessage(),
                    "Erro JDBC", JOptionPane.ERROR_MESSAGE);
            return;
        }

        // Coleções → JTable: percorremos a lista e adicionamos cada linha ao modelo.
        for (Object[] linha : linhas) {
            modelo.addRow(linha);
        }
    }
}
