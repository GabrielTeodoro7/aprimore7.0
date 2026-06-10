package escola.model;

import escola.enums.TipoUsuario;

/**
 * =================================================================================================
 * TÓPICO 4 — HERANÇA (Inheritance)
 * =================================================================================================
 * Aluno 'extends' Pessoa, herdando todos os seus atributos (nome, cpf) e comportamentos.
 * Isso evita duplicação de código e estabelece uma relação de "é um" (Aluno é uma Pessoa).
 * 
 * TÓPICO 8 — SOBREESCRITA (Method Overriding)
 * Utilizamos a anotação @Override para indicar que estamos dando uma nova implementação
 * ao método 'apresentar()' que foi definido na classe pai (Pessoa).
 * =================================================================================================
 */
public class Aluno extends Pessoa {

    private String matricula;
    private double notaMedia;

    /**
     * TÓPICO 2 — CONSTRUTORES (Constructors)
     * O construtor de Aluno invoca o construtor da classe pai usando 'super(...)'.
     */
    public Aluno(String nome, String cpf, String matricula, double notaMedia) {
        super(nome, cpf, TipoUsuario.ALUNO);
        this.matricula = matricula;
        this.notaMedia = notaMedia;
    }

    /**
     * TÓPICO 8 — POLIMORFISMO (Polymorphism)
     * Implementação específica do método apresentar para a classe Aluno.
     */
    @Override
    public String apresentar() {
        return "Aluno: " + getNome() + " | Matrícula: " + matricula + " | Média: " + notaMedia;
    }

    // TÓPICO 8 — SOBRECARGA (Method Overloading)
    // Exemplo de sobrecarga: o mesmo método com assinaturas diferentes (parâmetros diferentes).
    public void atualizarNota(double novaNota) {
        this.notaMedia = novaNota;
    }

    public void atualizarNota(double nota1, double nota2) {
        this.notaMedia = (nota1 + nota2) / 2;
    }

    // Getters e Setters (Encapsulamento)
    public String getMatricula() { return matricula; }
    public double getNotaMedia() { return notaMedia; }
    public void setNotaMedia(double notaMedia) { this.notaMedia = notaMedia; }
}
