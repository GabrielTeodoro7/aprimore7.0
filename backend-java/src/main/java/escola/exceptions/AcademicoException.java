package escola.exceptions;

/**
 * O QUE: Exceção para regras de negócio da vida acadêmica.
 * POR QUE: Centralizar erros de RN.14, RN.15, RN.47, etc.
 * CONTEÚDO ACADÊMICO: Exceções customizadas.
 */
public class AcademicoException extends Exception {
    public AcademicoException(String mensagem) {
        super(mensagem);
    }
}
