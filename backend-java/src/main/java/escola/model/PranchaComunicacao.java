package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// PranchaComunicacao — Prancha personalizada para inclusão (RN.24).
// CONTEÚDO ACADÊMICO: POJO, String (JSON).
// =============================================================================
public class PranchaComunicacao {
    private final UUID id;
    private final UUID userId;
    private final String titulo;
    private final String layoutJson;
    private final boolean favorita;
    private final Instant createdAt;

    public PranchaComunicacao(UUID id, UUID userId, String titulo, String layoutJson, boolean favorita, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.titulo = titulo;
        this.layoutJson = layoutJson;
        this.favorita = favorita;
        this.createdAt = createdAt;
    }

    // Getters
    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTitulo() { return titulo; }
    public String getLayoutJson() { return layoutJson; }
    public boolean isFavorita() { return favorita; }
    public Instant getCreatedAt() { return createdAt; }
}
