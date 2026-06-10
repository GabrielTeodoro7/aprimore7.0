package escola.model;

import java.time.Instant;
import java.util.UUID;

/**
 * RN.53 — Item da fila de sincronização offline.
 *
 * Conceitos demonstrados (didáticos):
 *  - Enum aninhado para estados (Status, Operacao);
 *  - Encapsulamento com getters/setters;
 *  - Uso de java.time.Instant (API moderna de datas).
 */
public class FilaSincronizacao {

    public enum Status { PENDENTE, PROCESSADO, ERRO }
    public enum Operacao { INSERT, UPDATE, DELETE }

    private UUID id;
    private UUID userId;
    private String entidade;
    private Operacao operacao;
    private String payloadJson;
    private Status status = Status.PENDENTE;
    private int tentativas = 0;
    private String erro;
    private Instant createdAt = Instant.now();
    private Instant processedAt;

    public FilaSincronizacao() {}

    public FilaSincronizacao(UUID userId, String entidade, Operacao operacao, String payloadJson) {
        this.userId = userId;
        this.entidade = entidade;
        this.operacao = operacao;
        this.payloadJson = payloadJson;
    }

    public void incrementarTentativas() { this.tentativas++; }

    // Getters/Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getEntidade() { return entidade; }
    public void setEntidade(String entidade) { this.entidade = entidade; }
    public Operacao getOperacao() { return operacao; }
    public void setOperacao(Operacao operacao) { this.operacao = operacao; }
    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public int getTentativas() { return tentativas; }
    public void setTentativas(int tentativas) { this.tentativas = tentativas; }
    public String getErro() { return erro; }
    public void setErro(String erro) { this.erro = erro; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }
}
