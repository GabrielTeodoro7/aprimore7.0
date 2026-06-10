package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// Bloqueio — Lock temporário por excesso de tentativas (RN.02).
// CONTEÚDO ACADÊMICO: POJO imutável; método de domínio (estaAtivo()).
// =============================================================================
public class Bloqueio {
    private final UUID id;
    private final UUID userId;        // pode ser null
    private final String email;
    private final Instant iniciouEm;
    private final Instant expiraEm;
    private final int tentativas;
    private final String motivo;
    private final boolean liberado;

    public Bloqueio(UUID id, UUID userId, String email,
                    Instant iniciouEm, Instant expiraEm,
                    int tentativas, String motivo, boolean liberado) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.iniciouEm = iniciouEm;
        this.expiraEm = expiraEm;
        this.tentativas = tentativas;
        this.motivo = motivo;
        this.liberado = liberado;
    }

    // Método de domínio: bloqueio ativo se não liberado e ainda dentro do prazo.
    // CONTEÚDO ACADÊMICO: encapsulamento de regra em método de instância.
    public boolean estaAtivo() {
        return !liberado && Instant.now().isBefore(expiraEm);
    }

    public long minutosRestantes() {
        long s = expiraEm.getEpochSecond() - Instant.now().getEpochSecond();
        return Math.max(0, s / 60);
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getEmail() { return email; }
    public Instant getIniciouEm() { return iniciouEm; }
    public Instant getExpiraEm() { return expiraEm; }
    public int getTentativas() { return tentativas; }
    public String getMotivo() { return motivo; }
    public boolean isLiberado() { return liberado; }
}
