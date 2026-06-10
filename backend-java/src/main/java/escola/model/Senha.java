package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// Senha — Registro do hash atual + histórico (RN.01).
// CONTEÚDO ACADÊMICO: POJO imutável; campos final; encapsulamento.
// =============================================================================
public class Senha {
    private final UUID id;
    private final UUID userId;
    private final String hash;          // PBKDF2 (formato "iter:salt:hash")
    private final String algoritmo;
    private final int iteracoes;
    private final Instant criadoEm;

    public Senha(UUID id, UUID userId, String hash,
                 String algoritmo, int iteracoes, Instant criadoEm) {
        this.id = id;
        this.userId = userId;
        this.hash = hash;
        this.algoritmo = algoritmo;
        this.iteracoes = iteracoes;
        this.criadoEm = criadoEm;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getHash() { return hash; }
    public String getAlgoritmo() { return algoritmo; }
    public int getIteracoes() { return iteracoes; }
    public Instant getCriadoEm() { return criadoEm; }
}
