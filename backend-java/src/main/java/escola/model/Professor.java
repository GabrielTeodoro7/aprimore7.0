package escola.model;

import escola.enums.TipoUsuario;

// =====================================================================
// TÓPICO 4 — HERANÇA  (Professor também estende Pessoa)
// TÓPICO 7 — POLIMORFISMO (apresentar() com comportamento próprio)
// =====================================================================
public class Professor extends Pessoa {

    private String disciplina;

    public Professor(String nome, String cpf, String disciplina) {
        super(nome, cpf, TipoUsuario.PROFESSOR);
        this.disciplina = disciplina;
    }

    @Override
    public String apresentar() {
        return "Prof. " + getNome() + " — " + disciplina;
    }

    public String getDisciplina() { return disciplina; }
}
