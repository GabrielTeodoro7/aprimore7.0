package escola.model;

import java.time.Instant;
import java.util.UUID;

public class ApiKey {
    private final UUID id;
    private final UUID userId;
    private final String keyHash;
    private final String escopo;
    private final Instant expiraEm;

    public ApiKey(UUID id, UUID userId, String keyHash, String escopo, Instant expiraEm) {
        this.id = id;
        this.userId = userId;
        this.keyHash = keyHash;
        this.escopo = escopo;
        this.expiraEm = expiraEm;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getKeyHash() { return keyHash; }
    public String getEscopo() { return escopo; }
    public Instant getExpiraEm() { return expiraEm; }
}
