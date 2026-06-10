package escola.exceptions;

// =====================================================================
// TÓPICO 11 — EXCEÇÕES (exceção customizada e checada)
// Lançada pelo AlunoDAO quando a matrícula não respeita as regras.
// =====================================================================
public class MatriculaInvalidaException extends Exception {
    public MatriculaInvalidaException(String mensagem) {
        super(mensagem);
    }
}
