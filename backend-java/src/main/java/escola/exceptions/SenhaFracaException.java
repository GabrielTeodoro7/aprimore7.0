package escola.exceptions;

// =============================================================================
// SenhaFracaException — Senha não atende à política (RN.01 / RN.62).
// CONTEÚDO ACADÊMICO: Exceção checada com lista de motivos detalhados.
// =============================================================================
import java.util.List;

public class SenhaFracaException extends Exception {
    private final List<String> motivos;
    public SenhaFracaException(List<String> motivos) {
        super("Senha não atende à política: " + String.join("; ", motivos));
        this.motivos = motivos;
    }
    public List<String> getMotivos() { return motivos; }
}
