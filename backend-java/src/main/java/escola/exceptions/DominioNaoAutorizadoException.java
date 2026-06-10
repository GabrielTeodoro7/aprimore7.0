package escola.exceptions;

// =============================================================================
// DominioNaoAutorizadoException — E-mail fora da whitelist (RN.35).
// =============================================================================
public class DominioNaoAutorizadoException extends Exception {
    private final String dominio;
    public DominioNaoAutorizadoException(String dominio) {
        super("Domínio de e-mail não autorizado: " + dominio);
        this.dominio = dominio;
    }
    public String getDominio() { return dominio; }
}
