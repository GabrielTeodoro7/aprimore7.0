package escola.exceptions;

// =====================================================================
// ONDA B.1 — LGPD (RN.45)
// Lançada quando uma operação requer consentimento que não foi concedido
// (ou foi revogado) para a finalidade necessária.
// =====================================================================
public class ConsentimentoAusenteException extends LgpdException {
    public ConsentimentoAusenteException(String finalidade) {
        super("Consentimento ausente ou revogado para a finalidade: " + finalidade);
    }
}
