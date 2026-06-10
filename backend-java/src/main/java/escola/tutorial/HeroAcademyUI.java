package escola.tutorial;

import javax.swing.*;
import java.awt.*;

/**
 * [TÓPICO 13: JAVA SWING]
 * Swing é a biblioteca de "Telas" do Java. 
 * É aqui que a gente cria botões, janelas e cores para o usuário não ver só letras pretas!
 */
public class HeroAcademyUI {
    
    public void showWindow() {
        /**
         * [COMPONENTES VISUAIS]
         * JFrame = A Janela
         * JLabel = O Texto na tela
         * JButton = O Botão para clicar
         */
        
        // 1. Criamos a moldura (Janela)
        JFrame frame = new JFrame("Academia de Heróis POO");
        frame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        frame.setSize(500, 300);
        
        // 2. Definimos como os itens ficam espalhados (Layout)
        frame.setLayout(new BorderLayout(10, 10));

        // 3. Criamos um título bonito
        JLabel label = new JLabel("BEM-VINDO À ACADEMIA!", SwingConstants.CENTER);
        label.setFont(new Font("Serif", Font.BOLD, 24));
        label.setForeground(new Color(41, 128, 185)); // Azul herói
        
        // 4. Criamos o botão de ação
        JButton button = new JButton("ATIVAR SUPER PODER!");
        button.setBackground(new Color(231, 76, 60)); // Vermelho alerta
        button.setForeground(Color.WHITE);
        button.setFocusPainted(false);
        button.setFont(new Font("Arial", Font.BOLD, 16));

        /**
         * [TRATAMENTO DE EVENTO]
         * O que acontece quando clica? O Java "escuta" o clique aqui.
         */
        button.addActionListener(e -> {
            // Abre uma janelinha de alerta (Pop-up)
            JOptionPane.showMessageDialog(frame, "POW! Você clicou no botão e ativou o Java Swing!");
        });

        // 5. Colocamos tudo dentro da Janela
        frame.add(label, BorderLayout.NORTH);
        frame.add(button, BorderLayout.CENTER);

        // 6. Finalmente, mostramos para o mundo!
        frame.setLocationRelativeTo(null); // Centraliza na tela
        frame.setVisible(true);
        
        System.out.println("[SWING] Janela visual aberta com sucesso!");
    }
}

