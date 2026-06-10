package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// RefreshToken — Token de renovação JWT (RN.03).
// CONTEÚDOS ACADÊMICOS:
//   - HERANÇA (extends TokenSeguro).
//   - POLIMORFISMO (sobrescreve estaValido()).
//   - Encapsulamento.
// =============================================================================
public class RefreshToken extends TokenSeguro {
    private final UUID userId;
    private final boolean rotacionado;
    private final boolean revogado;

    public RefreshToken(UUID id, UUID userId, String hash,
                        Instant criadoEm, Instant expiraEm,
                        boolean rotacionado, boolean revogado) {
        super(id, hash, criadoEm, expiraEm);
        this.userId = userId;
        this.rotacionado = rotacionado;
        this.revogado = revogado;
    }

    public UUID getUserId() { return userId; }
    public boolean isRotacionado() { return rotacionado; }
    public boolean isRevogado() { return revogado; }

    @Override
    public boolean estaValido() {
        // Polimorfismo: a regra de "válido" depende do tipo concreto.
        return !rotacionado && !revogado && !estaExpirado();
    }
}
