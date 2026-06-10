package escola.model;

import java.time.LocalDate;
import java.util.UUID;

/**
 * O QUE: Modelo para Plano de Desenvolvimento Individual (PDI).
 * POR QUE: RN.19 exige acompanhamento especializado para alunos com necessidades específicas.
 * QUANDO: Ao criar um plano de intervenção pedagógica.
 * CONTEÚDO ACADÊMICO: Classes e Objetos, Encapsulamento.
 */
public class Pdi {
    private UUID id;
    private UUID alunoId;
    private UUID professorResponsavelId;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private boolean ativo;
    private String objetivos;

    public Pdi() {}

    public Pdi(UUID alunoId, UUID professorResponsavelId, LocalDate dataInicio) {
        this.alunoId = alunoId;
        this.professorResponsavelId = professorResponsavelId;
        this.dataInicio = dataInicio;
        this.ativo = true;
    }

    // Getters e Setters (Encapsulamento)
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getAlunoId() { return alunoId; }
    public void setAlunoId(UUID alunoId) { this.alunoId = alunoId; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public String getObjetivos() { return objetivos; }
    public void setObjetivos(String objetivos) { this.objetivos = objetivos; }
}
