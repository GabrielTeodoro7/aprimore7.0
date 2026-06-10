package escola.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * RN.74-77: Representa uma mensalidade escolar.
 * Conceito Java: Encapsulamento e BigDecimal para valores monetários.
 */
public class Mensalidade {
    private UUID id;
    private UUID alunoId;
    private BigDecimal valor;
    private LocalDate dataVencimento;
    private String status; // PENDENTE, PAGO, ATRASADO

    public Mensalidade(UUID alunoId, BigDecimal valor, LocalDate dataVencimento) {
        this.alunoId = alunoId;
        this.valor = valor;
        this.dataVencimento = dataVencimento;
        this.status = "PENDENTE";
    }

    // Getters e Setters
    public BigDecimal getValor() { return valor; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getDataVencimento() { return dataVencimento; }

    /**
     * RN.75: Calcula juros simples de 1% ao mês caso esteja atrasado.
     */
    public BigDecimal calcularTotalComJuros() {
        if (!"ATRASADO".equals(status)) return valor;
        // Juros simples de 1% como exemplo acadêmico
        return valor.add(valor.multiply(new BigDecimal("0.01")));
    }
}
