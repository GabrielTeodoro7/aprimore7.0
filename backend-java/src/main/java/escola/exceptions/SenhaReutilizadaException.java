package escola.exceptions;

// =============================================================================
// SenhaReutilizadaException — Senha igual a uma das últimas N (RN.01).
// CONTEÚDO ACADÊMICO: especialização de Exception por contexto de negócio.
// =============================================================================
public class SenhaReutilizadaException extends Exception {
    private final int historicoN;
    public SenhaReutilizadaException(int historicoN) {
        super("Esta senha foi utilizada nas últimas " + historicoN
              + " trocas e não pode ser reutilizada.");
        this.historicoN = historicoN;
    }
    public int getHistoricoN() { return historicoN; }
}
