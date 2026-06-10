package escola.model;

import java.util.UUID;

public class LimitePlano {
    private final String recurso;
    private final int limiteMax;
    private int usoAtual;

    public LimitePlano(String recurso, int limiteMax, int usoAtual) {
        this.recurso = recurso;
        this.limiteMax = limiteMax;
        this.usoAtual = usoAtual;
    }

    public String getRecurso() { return recurso; }
    public int getLimiteMax() { return limiteMax; }
    public int getUsoAtual() { return usoAtual; }
    public void setUsoAtual(int usoAtual) { this.usoAtual = usoAtual; }
    
    public boolean podeIncrementar() {
        return usoAtual < limiteMax;
    }
}
