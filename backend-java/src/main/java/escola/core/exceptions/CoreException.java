package escola.core.exceptions;

/**
 * =================================================================================================
 * TÓPICO 11 — EXCEÇÕES DO JAVA (Exception Handling)
 * =================================================================================================
 * No Java, exceções são objetos. Ao estender 'Exception', criamos uma Checked Exception.
 * Isso significa que o compilador exigirá que o programador trate o erro (usando try-catch)
 * ou declare que o método repassa o erro (usando throws).
 * 
 * TÓPICO 4 — HERANÇA
 * CoreException estende Exception, ganhando todas as capacidades de rastreamento de erro da JVM.
 * =================================================================================================
 */
public class CoreException extends Exception {
    
    private final String errorCode;

    /**
     * TÓPICO 2 — CONSTRUTOR
     * Repassa a mensagem de erro para a classe pai (super) e armazena um código interno.
     */
    public CoreException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
