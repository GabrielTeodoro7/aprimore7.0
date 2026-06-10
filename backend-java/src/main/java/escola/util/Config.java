package escola.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

// =====================================================================
// TÓPICO 9 — JAVA IO
// Lê o arquivo config.properties do classpath.
// =====================================================================
public final class Config {
    private static final Properties PROPS = new Properties();

    static {
        try (InputStream in = Config.class.getResourceAsStream("/config.properties")) {
            if (in == null) throw new IOException("config.properties não encontrado");
            PROPS.load(in);
        } catch (IOException e) {
            throw new RuntimeException("Falha ao carregar configuração", e);
        }
    }

    private Config() {}

    public static String get(String chave) { return PROPS.getProperty(chave); }
    public static int getInt(String chave) { return Integer.parseInt(PROPS.getProperty(chave)); }
}
