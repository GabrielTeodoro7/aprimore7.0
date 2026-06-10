package escola.model;

import java.time.Instant;
import java.util.UUID;

/**
 * RN.56 — Sugestão pedagógica gerada pela IA, vinculada a um aluno.
 *
 * Conceitos didáticos: enum interno, encapsulamento, imutabilidade parcial.
 */
public class SugestaoPedagogica {

    public enum Prioridade { BAIXA, MEDIA, ALTA }

    private UUID id;
    private UUID alunoId;
    private UUID professorId;
    private String contexto;
    private String sugestao;
    private Prioridade prioridade = Prioridade.MEDIA;
    private boolean aplicada = false;
    private Instant createdAt = Instant.now();

    public SugestaoPedagogica() {}

    public SugestaoPedagogica(UUID alunoId, String sugestao, Prioridade prioridade) {
        this.alunoId = alunoId;
        this.sugestao = sugestao;
        this.prioridade = prioridade;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getAlunoId() { return alunoId; }
    public void setAlunoId(UUID alunoId) { this.alunoId = alunoId; }
    public UUID getProfessorId() { return professorId; }
    public void setProfessorId(UUID professorId) { this.professorId = professorId; }
    public String getContexto() { return contexto; }
    public void setContexto(String contexto) { this.contexto = contexto; }
    public String getSugestao() { return sugestao; }
    public void setSugestao(String sugestao) { this.sugestao = sugestao; }
    public Prioridade getPrioridade() { return prioridade; }
    public void setPrioridade(Prioridade prioridade) { this.prioridade = prioridade; }
    public boolean isAplicada() { return aplicada; }
    public void setAplicada(boolean aplicada) { this.aplicada = aplicada; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
