package escola.core.io;

import java.io.*;
import java.nio.file.*;
import java.util.List;

/**
 * =================================================================================================
 * TÓPICO 9 — JAVA IO (Entrada e Saída)
 * =================================================================================================
 * O Java IO (ou NIO.2 no caso do pacote nio) permite ler e gravar arquivos no disco rígido.
 * É essencial para persistir logs, configurações ou gerar relatórios em PDF/CSV.
 * 
 * TÓPICO 11 — EXCEÇÕES DO JAVA
 * Operações de arquivo são arriscadas (disco cheio, arquivo bloqueado, sem permissão), 
 * por isso quase todos os métodos lançam 'IOException'.
 * =================================================================================================
 */
public class FileManager {

    /**
     * TÓPICO 9 — JAVA IO: Escrita de Arquivos
     * Grava uma lista de strings em um arquivo, criando-o ou sobrescrevendo-o.
     */
    public void writeToFile(String filename, List<String> lines) throws IOException {
        Path path = Paths.get(filename);
        // Files.write é uma forma moderna e eficiente (NIO) de gravar dados em lote.
        Files.write(path, lines, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    /**
     * TÓPICO 9 — JAVA IO: Leitura de Arquivos
     * Lê todo o conteúdo de um arquivo texto e devolve como uma Lista de Strings.
     */
    public List<String> readFromFile(String filename) throws IOException {
        return Files.readAllLines(Paths.get(filename));
    }
}
