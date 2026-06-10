package escola.model;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * RN.65-70: Modelagem para dados analíticos (BI).
 * Conceito Java: POJO e Encapsulamento.
 */
public class BiData {
    private UUID turmaId;
    private BigDecimal mediaGeral;
    private double percentualAprovacao;
    private String referencia; // MM/YYYY

    public BiData(UUID turmaId, BigDecimal mediaGeral, double percentualAprovacao, String referencia) {
        this.turmaId = turmaId;
        this.mediaGeral = mediaGeral;
        this.percentualAprovacao = percentualAprovacao;
        this.referencia = referencia;
    }

    public UUID getTurmaId() { return turmaId; }
    public BigDecimal getMediaGeral() { return mediaGeral; }
    public double getPercentualAprovacao() { return percentualAprovacao; }
    public String getReferencia() { return referencia; }
}
