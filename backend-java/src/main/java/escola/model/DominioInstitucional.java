package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// DominioInstitucional — Whitelist de e-mails (RN.35).
// CONTEÚDO ACADÊMICO: POJO simples, Encapsulamento.
// =============================================================================
public class DominioInstitucional {
    private final UUID id;
    private final String dominio;
    private final String descricao;
    private final boolean obrigatorio;
    private final boolean ativo;
    private final Instant criadoEm;

    public DominioInstitucional(UUID id, String dominio, String descricao,
                                boolean obrigatorio, boolean ativo, Instant criadoEm) {
        this.id = id;
        this.dominio = dominio;
        this.descricao = descricao;
        this.obrigatorio = obrigatorio;
        this.ativo = ativo;
        this.criadoEm = criadoEm;
    }

    public UUID getId() { return id; }
    public String getDominio() { return dominio; }
    public String getDescricao() { return descricao; }
    public boolean isObrigatorio() { return obrigatorio; }
    public boolean isAtivo() { return ativo; }
    public Instant getCriadoEm() { return criadoEm; }
}
