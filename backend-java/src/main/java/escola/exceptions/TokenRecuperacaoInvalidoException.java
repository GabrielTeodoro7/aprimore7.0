package escola.exceptions;

// =============================================================================
// TokenRecuperacaoInvalidoException — Token expirado, usado ou inexistente (RN.07).
// CONTEÚDO ACADÊMICO: Exceção de borda usada na confirmação de reset.
// =============================================================================
public class TokenRecuperacaoInvalidoException extends Exception {
    public TokenRecuperacaoInvalidoException() {
        super("Token de recuperação inválido ou expirado.");
    }
}
