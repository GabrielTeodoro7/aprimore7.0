package escola.core.exceptions;

/**
 * [EXCEÇÕES DO JAVA]
 * Classe base para todas as exceções de negócio do sistema.
 * Permite capturar erros específicos em blocos catch polimórficos.
 */
public class CoreException extends Exception {
    private final String errorCode;

    public CoreException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
