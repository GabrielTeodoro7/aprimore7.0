package escola.model;

import java.time.Instant;
import java.util.UUID;

/**
 * RN.57 — Risco acadêmico detectado pela IA com base em métricas do aluno.
 *
 * Conceitos didáticos: enum tipado com método auxiliar.
 */
public class RiscoAcademico {

    public enum Nivel {
        BAIXO, MEDIO, ALTO, CRITICO;

        public boolean exigeAcaoImediata() {
            return this == ALTO || this == CRITICO;
        }
    }

    private UUID id;
    private UUID alunoId;
    private Nivel nivel;
    private String indicadoresJson;
    private boolean resolvido = false;
    private Instant detectadoEm = Instant.now();

    public RiscoAcademico() {}

    public RiscoAcademico(UUID alunoId, Nivel nivel, String indicadoresJson) {
        this.alunoId = alunoId;
        this.nivel = nivel;
        this.indicadoresJson = indicadoresJson;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getAlunoId() { return alunoId; }
    public void setAlunoId(UUID alunoId) { this.alunoId = alunoId; }
    public Nivel getNivel() { return nivel; }
    public void setNivel(Nivel nivel) { this.nivel = nivel; }
    public String getIndicadoresJson() { return indicadoresJson; }
    public void setIndicadoresJson(String s) { this.indicadoresJson = s; }
    public boolean isResolvido() { return resolvido; }
    public void setResolvido(boolean resolvido) { this.resolvido = resolvido; }
    public Instant getDetectadoEm() { return detectadoEm; }
    public void setDetectadoEm(Instant t) { this.detectadoEm = t; }
}
