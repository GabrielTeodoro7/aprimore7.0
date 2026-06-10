package escola.exceptions;

// =============================================================================
// AnomaliaAcessoException — Login fora do padrão exige confirmação extra (RN.61).
// =============================================================================
public class AnomaliaAcessoException extends Exception {
    private final String tipo;
    public AnomaliaAcessoException(String tipo) {
        super("Anomalia de acesso detectada: " + tipo
              + ". Confirmação adicional necessária.");
        this.tipo = tipo;
    }
    public String getTipo() { return tipo; }
}
