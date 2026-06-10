package escola.model;

import java.time.LocalDateTime;
import java.util.UUID;

// =====================================================================
// ONDA B.1 — LGPD (RN.45)
// Consentimento granular por finalidade. Espelha public.consentimentos.
// =====================================================================
public class Consentimento {

    public enum Finalidade {
        CADASTRO,
        IMAGEM,
        COMUNICACOES,
        COMPARTILHAMENTO
    }

    private final UUID id;
    private final UUID profileId;
    private final Finalidade finalidade;
    private boolean concedido;
    private LocalDateTime concedidoEm;
    private LocalDateTime revogadoEm;

    public Consentimento(UUID id, UUID profileId, Finalidade finalidade,
                         boolean concedido, LocalDateTime concedidoEm,
                         LocalDateTime revogadoEm) {
        this.id = id;
        this.profileId = profileId;
        this.finalidade = finalidade;
        this.concedido = concedido;
        this.concedidoEm = concedidoEm;
        this.revogadoEm = revogadoEm;
    }

    public UUID getId() { return id; }
    public UUID getProfileId() { return profileId; }
    public Finalidade getFinalidade() { return finalidade; }
    public boolean isConcedido() { return concedido; }
    public LocalDateTime getConcedidoEm() { return concedidoEm; }
    public LocalDateTime getRevogadoEm() { return revogadoEm; }

    public void conceder() {
        this.concedido = true;
        this.concedidoEm = LocalDateTime.now();
        this.revogadoEm = null;
    }

    public void revogar() {
        this.concedido = false;
        this.revogadoEm = LocalDateTime.now();
    }
}
