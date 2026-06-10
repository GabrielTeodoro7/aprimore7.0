package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// Denuncia — Moderação de mensagens (RN.25).
// CONTEÚDO ACADÊMICO: POJO, Enumeração, Instant.
// =============================================================================
public class Denuncia {
    private final UUID id;
    private final UUID mensagemId;
    private final UUID denuncianteId;
    private final String motivo;
    private final String detalhes;
    private final Status status;
    private final Instant dataDenuncia;
    private final UUID moderadorId;

    public enum Status {
        PENDENTE, EM_ANALISE, ACATADA, REJEITADA
    }

    public Denuncia(UUID id, UUID mensagemId, UUID denuncianteId, String motivo, 
                    String detalhes, Status status, Instant dataDenuncia, UUID moderadorId) {
        this.id = id;
        this.mensagemId = mensagemId;
        this.denuncianteId = denuncianteId;
        this.motivo = motivo;
        this.detalhes = detalhes;
        this.status = status;
        this.dataDenuncia = dataDenuncia;
        this.moderadorId = moderadorId;
    }

    // Getters
    public UUID getId() { return id; }
    public UUID getMensagemId() { return mensagemId; }
    public UUID getDenuncianteId() { return denuncianteId; }
    public String getMotivo() { return motivo; }
    public String getDetalhes() { return detalhes; }
    public Status getStatus() { return status; }
    public Instant getDataDenuncia() { return dataDenuncia; }
    public UUID getModeradorId() { return moderadorId; }
}
