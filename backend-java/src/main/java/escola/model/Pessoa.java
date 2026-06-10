package escola.model;

import escola.enums.TipoUsuario;

// =====================================================================
// TÓPICO 6 — CLASSE ABSTRATA
// Não pode ser instanciada diretamente; serve de base para Aluno/Professor.
//
// TÓPICO 3 — ENCAPSULAMENTO
// Atributos privados expostos apenas por getters/setters controlados.
// =====================================================================
public abstract class Pessoa {

    private String nome;
    private String cpf;
    private final TipoUsuario tipo; // TÓPICO 10 (Enum) usado como campo

    // TÓPICO 2 — CONSTRUTOR (chamado pelas subclasses via super(...))
    protected Pessoa(String nome, String cpf, TipoUsuario tipo) {
        this.nome = nome;
        this.cpf = cpf;
        this.tipo = tipo;
    }

    // TÓPICO 7 — POLIMORFISMO (método abstrato sobrescrito nas filhas)
    public abstract String apresentar();

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public TipoUsuario getTipo() { return tipo; }
}
