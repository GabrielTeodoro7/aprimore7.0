package escola.exceptions;

// =============================================================================
// ContaBloqueadaException — Conta bloqueada por excesso de tentativas (RN.02).
// -----------------------------------------------------------------------------
// O QUE FAZ: sinaliza que o usuário não pode efetuar login agora.
// POR QUE: separa um erro de negócio específico de um genérico.
// QUANDO: lançar dentro de SegurancaService quando o lock estiver ativo.
// CONTEÚDO ACADÊMICO: Herança (estende Exception), Exceções checadas.
// =============================================================================
public class ContaBloqueadaException extends Exception {
    private final long minutosRestantes;
    public ContaBloqueadaException(long minutosRestantes) {
        super("Conta temporariamente bloqueada. Tente novamente em "
              + minutosRestantes + " minuto(s).");
        this.minutosRestantes = minutosRestantes;
    }
    public long getMinutosRestantes() { return minutosRestantes; }
}
