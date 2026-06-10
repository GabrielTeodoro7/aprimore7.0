package escola.model;

import java.util.UUID;

public class Escola {
    private final UUID id;
    private final String nome;
    private final String cnpj;
    private final String slug;
    private final boolean ativo;

    public Escola(UUID id, String nome, String cnpj, String slug, boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.cnpj = cnpj;
        this.slug = slug;
        this.ativo = ativo;
    }

    public UUID getId() { return id; }
    public String getNome() { return nome; }
    public String getCnpj() { return cnpj; }
    public String getSlug() { return slug; }
    public boolean isAtivo() { return ativo; }
}
