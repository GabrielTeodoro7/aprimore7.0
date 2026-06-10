package escola.model;

import java.time.Instant;
import java.util.UUID;

public class RelatorioJob {
    private final UUID id;
    private final UUID userId;
    private final String tipoRelatorio;
    private final String formato;
    private Status status;
    private String arquivoUrl;

    public enum Status { PENDENTE, PROCESSANDO, CONCLUIDO, ERRO }

    public RelatorioJob(UUID id, UUID userId, String tipoRelatorio, String formato, Status status) {
        this.id = id;
        this.userId = userId;
        this.tipoRelatorio = tipoRelatorio;
        this.formato = formato;
        this.status = status;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTipoRelatorio() { return tipoRelatorio; }
    public String getFormato() { return formato; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getArquivoUrl() { return arquivoUrl; }
    public void setArquivoUrl(String arquivoUrl) { this.arquivoUrl = arquivoUrl; }
}
