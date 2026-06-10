package escola.tutorial;

import java.io.*;
import java.nio.file.*;

/**
 * [TÓPICO 9: JAVA IO (Input/Output)]
 * É a forma que o Java tem de "Falar" e "Ouvir" o disco rígido.
 * Aqui nós escrevemos um arquivo físico no computador.
 */
public class HeroFiles {
    
    /**
     * [ESCREVENDO ARQUIVOS]
     * Usamos a classe 'Files' do Java NIO, que é a versão moderna do IO.
     */
    public static void saveJournal(String heroName, String story) {
        // Define o nome do arquivo (Ex: diario_Batman.txt)
        Path path = Paths.get("diario_" + heroName + ".txt");
        
        try {
            // Escreve o texto no arquivo. Se o arquivo não existir, o Java cria!
            String content = "--- DIÁRIO DE MISSÃO ---\nHerói: " + heroName + "\nRelato: " + story;
            Files.writeString(path, content);
            
            System.out.println("[JAVA-IO] Diário salvo em: " + path.toAbsolutePath());
        } catch (IOException e) {
            // Caso o disco esteja cheio ou não tenhamos permissão
            System.err.println("[JAVA-IO-ERRO] Falha ao escrever arquivo: " + e.getMessage());
        }
    }
}

