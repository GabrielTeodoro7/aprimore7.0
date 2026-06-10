package escola.model;

import java.util.UUID;

public class Selo {
    private final UUID id;
    private final String nome;
    private final String icone;
    private final String categoria;

    public Selo(UUID id, String nome, String icone, String categoria) {
        this.id = id;
        this.nome = nome;
        this.icone = icone;
        this.categoria = categoria;
    }

    public UUID getId() { return id; }
    public String getNome() { return nome; }
    public String getIcone() { return icone; }
    public String getCategoria() { return categoria; }
}
