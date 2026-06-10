package escola.model;

import escola.enums.TipoUsuario;

/**
 * =================================================================================================
 * TÓPICO 6 — CLASSES ABSTRATAS (Abstract Classes)
 * =================================================================================================
 * Esta classe é marcada como 'abstract', o que significa que ela não pode ser instanciada 
 * diretamente (não podemos dar 'new Pessoa()'). Ela serve como um "molde" ou contrato base 
 * para classes mais específicas, como Aluno e Professor.
 * 
 * TÓPICO 1 — CLASSES E OBJETOS (Classes and Objects)
 * Pessoa define a estrutura e o comportamento comum a todos os seres humanos no sistema.
 * 
 * TÓPICO 3 — ENCAPSULAMENTO (Encapsulation)
 * Os campos (nome, cpf, tipo) são 'private' ou 'final', protegendo o estado interno.
 * O acesso é feito apenas através de métodos públicos (Getters/Setters).
 * =================================================================================================
 */
public abstract class Pessoa {

    private String nome;
    private String cpf;
    
    // TÓPICO 10 — ENUM EM JAVA
    // Utilizamos o Enum TipoUsuario para garantir que o tipo seja sempre válido (ALUNO, PROFESSOR, etc).
    private final TipoUsuario tipo; 

    /**
     * TÓPICO 2 — CONSTRUTORES (Constructors)
     * Construtor protected: apenas subclasses podem chamá-lo via 'super()'.
     * Garante que toda Pessoa nasça com nome, cpf e um tipo definido.
     */
    protected Pessoa(String nome, String cpf, TipoUsuario tipo) {
        this.nome = nome;
        this.cpf = cpf;
        this.tipo = tipo;
    }

    /**
     * TÓPICO 8 — POLIMORFISMO (Polymorphism)
     * Método abstrato: define que toda pessoa SABE se apresentar, mas cada subclasse
     * (Aluno/Professor) decide COMO fazer isso (sobrescrevendo o método).
     */
    public abstract String apresentar();

    // Getters e Setters (Encapsulamento)
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    
    public TipoUsuario getTipo() { return tipo; }
}
