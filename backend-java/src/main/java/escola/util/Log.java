package escola.util;

import java.util.logging.ConsoleHandler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

// Logging padrão (java.util.logging) — substitui System.out.println pelo log estruturado.
public final class Log {
    private Log() {}

    public static Logger get(Class<?> c) {
        Logger l = Logger.getLogger(c.getName());
        if (l.getHandlers().length == 0) {
            ConsoleHandler h = new ConsoleHandler();
            h.setFormatter(new SimpleFormatter());
            h.setLevel(Level.ALL);
            l.addHandler(h);
            l.setUseParentHandlers(false);
            l.setLevel(Level.ALL);
        }
        return l;
    }
}
