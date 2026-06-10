package escola.model;

import java.time.LocalDateTime;
import java.util.UUID;

// =====================================================================
// ONDA B.1 — LGPD (RN.63)
// Registro imutável de acesso a dado sensível (CPF, contato etc.).
// Espelha public.logs_acesso_sensiveis (UPDATE/DELETE bloqueados).
// =====================================================================
public class LogAcessoSensivel {

    private final UUID id;
    private final UUID actorId;
    private final UUID alunoId;
    private final String campo;
    private final String justificativa;
    private final boolean contextoNormal;
    private final LocalDateTime createdAt;

    public LogAcessoSensivel(UUID id, UUID actorId, UUID alunoId, String campo,
                             String justificativa, boolean contextoNormal,
                             LocalDateTime createdAt) {
        this.id = id;
        this.actorId = actorId;
        this.alunoId = alunoId;
        this.campo = campo;
        this.justificativa = justificativa;
        this.contextoNormal = contextoNormal;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getActorId() { return actorId; }
    public UUID getAlunoId() { return alunoId; }
    public String getCampo() { return campo; }
    public String getJustificativa() { return justificativa; }
    public boolean isContextoNormal() { return contextoNormal; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
