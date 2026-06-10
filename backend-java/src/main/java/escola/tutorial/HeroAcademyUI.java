package escola.tutorial;

import javax.swing.*;
import java.awt.*;

/**
 * [O QUE] Java Swing
 * [POR QUE] Criar uma janela visual para o usuário ver os heróis.
 * [CONTEÚDO] Java Swing
 * 
 * É como desenhar a cara do seu programa!
 */
public class HeroAcademyUI {
    
    public void showWindow() {
        // Criando a janela principal
        JFrame frame = new JFrame("Academia de Heróis POO");
        frame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        frame.setSize(400, 300);
        frame.setLayout(new FlowLayout());

        // Criando componentes
        JLabel label = new JLabel("Bem-vindo à Academia de Heróis!");
        label.setFont(new Font("Arial", Font.BOLD, 18));
        
        JButton button = new JButton("Ativar Super Poder!");
        button.addActionListener(e -> {
            JOptionPane.showMessageDialog(frame, "CABRUM! Poder ativado com Swing!");
        });

        // Adicionando na janela
        frame.add(label);
        frame.add(button);

        // Mostrando!
        frame.setVisible(true);
        System.out.println("Janela Swing aberta!");
    }
}
