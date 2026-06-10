package escola.tutorial;

import java.io.*;
import java.nio.file.*;

/**
 * [O QUE] Java IO
 * [POR QUE] Escrever o diário do herói em um arquivo de texto.
 * [CONTEÚDO] Java IO (NIO)
 */
public class HeroFiles {
    
    public static void saveJournal(String heroName, String story) {
        Path path = Paths.get("diario_" + heroName + ".txt");
        try {
            // Escrevendo no arquivo
            Files.writeString(path, "Diário Secreto de " + heroName + ":\n" + story);
            System.out.println("Arquivo de diário criado: " + path.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Erro de IO: " + e.getMessage());
        }
    }
}
