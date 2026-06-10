package escola.exceptions;

// =====================================================================
// ONDA B.1 — LGPD (RN.05)
// Lançada quando o usuário ainda não aceitou a versão vigente dos termos
// e tenta executar uma operação que exige aceite.
// =====================================================================
public class TermosNaoAceitosException extends LgpdException {
    public TermosNaoAceitosException(String versao) {
        super("Usuário não aceitou a versão vigente dos termos: " + versao);
    }
}
