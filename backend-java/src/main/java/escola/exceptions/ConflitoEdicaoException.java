package escola.exceptions;

/**
 * O QUE: Exceção customizada para conflitos de edição simultânea.
 * POR QUE: Implementa a RN.50 de forma robusta no backend.
 * CONTEÚDO ACADÊMICO: Exceções, Herança.
 */
public class ConflitoEdicaoException extends LgpdException {
    public ConflitoEdicaoException(String mensagem) {
        super(mensagem);
    }
}
