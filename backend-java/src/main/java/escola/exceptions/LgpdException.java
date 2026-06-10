package escola.exceptions;

// =====================================================================
// ONDA B.1 — LGPD
// Exceção base para erros relacionados a conformidade LGPD.
// =====================================================================
public class LgpdException extends Exception {
    public LgpdException(String mensagem) {
        super(mensagem);
    }
}
