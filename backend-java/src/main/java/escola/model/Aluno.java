package escola.model;

import escola.enums.TipoUsuario;

// =====================================================================
// TÓPICO 1 — CLASSES E OBJETOS  (Aluno é uma classe; new Aluno(...) cria objetos)
// TÓPICO 4 — HERANÇA            (Aluno herda de Pessoa)
// TÓPICO 7 — POLIMORFISMO       (sobrescreve apresentar())
// =====================================================================
public class Aluno extends Pessoa {

    private String matricula;
    private double notaMedia;

    // TÓPICO 2 — CONSTRUTOR
    public Aluno(String nome, String cpf, String matricula, double notaMedia) {
        super(nome, cpf, TipoUsuario.ALUNO);
        this.matricula = matricula;
        this.notaMedia = notaMedia;
    }

    @Override
    public String apresentar() {
        return "Aluno " + getNome() + " (matrícula " + matricula + ")";
    }

    public String getMatricula() { return matricula; }
    public double getNotaMedia() { return notaMedia; }
    public void setNotaMedia(double notaMedia) { this.notaMedia = notaMedia; }
}
