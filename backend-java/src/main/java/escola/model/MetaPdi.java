package escola.model;

import java.time.LocalDate;
import java.util.UUID;

/**
 * O QUE: Modelo para Meta do PDI.
 * POR QUE: RN.20, RN.21 e RN.22 exigem controle granular do progresso do aluno.
 * CONTEÚDO ACADÊMICO: Classes e Objetos, Construtores parametrizados.
 */
public class MetaPdi {
    private UUID id;
    private UUID pdiId;
    private String titulo;
    private String descricao;
    private LocalDate prazo;
    private boolean concluida;
    private String comentarioConclusao;

    public MetaPdi(UUID pdiId, String titulo, LocalDate prazo) {
        this.pdiId = pdiId;
        this.titulo = titulo;
        this.prazo = prazo;
        this.concluida = false;
    }

    public boolean estaVencida() {
        // RN.22: Meta vencida se a data atual ultrapassou o prazo e não foi concluída
        return !concluida && LocalDate.now().isAfter(prazo);
    }

    // Getters e Setters
    public UUID getId() { return id; }
    public String getTitulo() { return titulo; }
    public LocalDate getPrazo() { return prazo; }
    public boolean isConcluida() { return concluida; }
    
    public void setConcluida(boolean concluida, String comentario) {
        // RN.21: Comentário obrigatório na conclusão
        if (concluida && (comentario == null || comentario.trim().isEmpty())) {
            throw new IllegalArgumentException("Comentário é obrigatório ao concluir meta (RN.21)");
        }
        this.concluida = concluida;
        this.comentarioConclusao = comentario;
    }
}
