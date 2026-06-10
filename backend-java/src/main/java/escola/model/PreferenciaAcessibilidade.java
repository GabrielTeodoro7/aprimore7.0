package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// PreferenciaAcessibilidade — Sincronização de preferências de acessibilidade (RN.37).
// CONTEÚDO ACADÊMICO: POJO, Encapsulamento, Enumeração.
// =============================================================================
public class PreferenciaAcessibilidade {
    private final UUID userId;
    private final boolean altoContraste;
    private final boolean fonteAmpliada;
    private final boolean leituraTela;
    private final boolean atalhosTeclado;
    private final Daltonismo daltonismoTipo;
    private final Instant ultimaSincronizacao;

    public enum Daltonismo {
        NENHUM, PROTANOPLA, DEUTERANOPLA, TRITANOPLA, ACROMATOPSIA
    }

    public PreferenciaAcessibilidade(UUID userId, boolean altoContraste, boolean fonteAmpliada, 
                                     boolean leituraTela, boolean atalhosTeclado, 
                                     Daltonismo daltonismoTipo, Instant ultimaSincronizacao) {
        this.userId = userId;
        this.altoContraste = altoContraste;
        this.fonteAmpliada = fonteAmpliada;
        this.leituraTela = leituraTela;
        this.atalhosTeclado = atalhosTeclado;
        this.daltonismoTipo = daltonismoTipo;
        this.ultimaSincronizacao = ultimaSincronizacao;
    }

    // Getters
    public UUID getUserId() { return userId; }
    public boolean isAltoContraste() { return altoContraste; }
    public boolean isFonteAmpliada() { return fonteAmpliada; }
    public boolean isLeituraTela() { return leituraTela; }
    public boolean isAtalhosTeclado() { return atalhosTeclado; }
    public Daltonismo getDaltonismoTipo() { return daltonismoTipo; }
    public Instant getUltimaSincronizacao() { return ultimaSincronizacao; }
}
