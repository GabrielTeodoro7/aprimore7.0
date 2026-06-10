package escola.model;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * RN.53, RN.54: Representa um item na fila de sincronização offline.
 * Conceito Java: POJO (Plain Old Java Object) com Encapsulamento.
 */
public class SyncQueue {
    private UUID id;
    private UUID userId;
    private String operation; // INSERT, UPDATE, DELETE
    private String tableName;
    private String payload; // JSON
    private String status; // PENDENTE, SYNCED, FAILED
    private int retryCount;
    private LocalDateTime createdAt;

    public SyncQueue() {}

    public SyncQueue(UUID userId, String operation, String tableName, String payload) {
        this.userId = userId;
        this.operation = operation;
        this.tableName = tableName;
        this.payload = payload;
        this.status = "PENDENTE";
        this.retryCount = 0;
        this.createdAt = LocalDateTime.now();
    }

    // Getters e Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public String getOperation() { return operation; }
    public String getTableName() { return tableName; }
    public String getPayload() { return payload; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }
}
