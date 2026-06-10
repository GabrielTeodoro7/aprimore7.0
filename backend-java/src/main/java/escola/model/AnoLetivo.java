package escola.model;

import java.time.LocalDate;
import java.util.UUID;
import escola.interfaces.Versionavel;

/**
 * O QUE: Classe de modelo que representa um Ano Letivo.
 * POR QUE: Necessário para organizar turmas e matrículas por ciclos temporais (RN.10).
 * CONTEÚDO ACADÊMICO: Classes e Objetos, Encapsulamento, Datas (Java Time), Interfaces.
 */
public class AnoLetivo implements Versionavel {
    private UUID id;
    private int ano;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String status;
    private int versao;

    public AnoLetivo() {}

    public AnoLetivo(int ano, LocalDate dataInicio, LocalDate dataFim, String status) {
        this.ano = ano;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.status = status;
        this.versao = 1;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public int getVersao() { return versao; }
    
    public void setVersao(int versao) { this.versao = versao; }

    @Override
    public void incrementarVersao() { 
        this.versao++; 
    }
}
