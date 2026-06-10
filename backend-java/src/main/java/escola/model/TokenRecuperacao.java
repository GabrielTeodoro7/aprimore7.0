package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// TokenRecuperacao — Token de e-mail para reset de senha (RN.07).
// CONTEÚDOS ACADÊMICOS: Herança, Polimorfismo, Encapsulamento.
// =============================================================================
public class TokenRecuperacao extends TokenSeguro {
    private final UUID userId;         // pode ser null (anti-enumeração)
    private final String emailAlvo;
    private final boolean usado;

    public TokenRecuperacao(UUID id, UUID userId, String emailAlvo, String hash,
                            Instant criadoEm, Instant expiraEm, boolean usado) {
        super(id, hash, criadoEm, expiraEm);
        this.userId = userId;
        this.emailAlvo = emailAlvo;
        this.usado = usado;
    }

    public UUID getUserId() { return userId; }
    public String getEmailAlvo() { return emailAlvo; }
    public boolean isUsado() { return usado; }

    @Override
    public boolean estaValido() {
        return !usado && !estaExpirado();
    }
}
