package escola.model;

// Disciplina simples (Classes e Objetos / Encapsulamento / Construtor).
public class Disciplina {
    private final String codigo;
    private final String nome;
    private final int cargaHoraria;

    public Disciplina(String codigo, String nome, int cargaHoraria) {
        this.codigo = codigo;
        this.nome = nome;
        this.cargaHoraria = cargaHoraria;
    }

    public String getCodigo() { return codigo; }
    public String getNome() { return nome; }
    public int getCargaHoraria() { return cargaHoraria; }
}
