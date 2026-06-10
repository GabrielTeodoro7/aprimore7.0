package escola.model;

import java.time.LocalDateTime;
import java.util.UUID;

// =====================================================================
// ONDA B.1 — LGPD (RN.05)
// Registro imutável de aceite de um documento legal por um usuário.
// Espelha public.termos_aceitos (UPDATE/DELETE bloqueados por trigger).
// =====================================================================
public class TermoAceito {

    private final UUID id;
    private final UUID profileId;
    private final UUID documentoId;
    private final LocalDateTime aceitoEm;
    private final String ip;
    private final String userAgent;

    public TermoAceito(UUID id, UUID profileId, UUID documentoId,
                       LocalDateTime aceitoEm, String ip, String userAgent) {
        this.id = id;
        this.profileId = profileId;
        this.documentoId = documentoId;
        this.aceitoEm = aceitoEm;
        this.ip = ip;
        this.userAgent = userAgent;
    }

    public UUID getId() { return id; }
    public UUID getProfileId() { return profileId; }
    public UUID getDocumentoId() { return documentoId; }
    public LocalDateTime getAceitoEm() { return aceitoEm; }
    public String getIp() { return ip; }
    public String getUserAgent() { return userAgent; }
}
