package escola.core.io;

import java.io.*;
import java.nio.file.*;
import java.util.List;

/**
 * [JAVA IO / NIO.2]
 * Abstração para manipulação de arquivos de alta performance.
 */
public class FileManager {

    /**
     * [IO] Escrita assíncrona/segura utilizando buffers.
     */
    public void writeToFile(String filename, List<String> lines) throws IOException {
        Path path = Paths.get(filename);
        Files.write(path, lines, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    /**
     * [IO] Leitura eficiente linha a linha.
     */
    public List<String> readFromFile(String filename) throws IOException {
        return Files.readAllLines(Paths.get(filename));
    }
}
