package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// TokenSeguro — CLASSE ABSTRATA base para tokens hash-only (RN.03 / RN.07).
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   Define o esqueleto comum a tokens armazenados como hash (refresh,
//   recuperação de senha, API key, etc.).
//
// POR QUE FOI UTILIZADO:
//   Centraliza a regra "nunca armazene o token em claro; armazene apenas o
//   hash" e a validação de expiração. Subclasses preenchem o resto.
//
// QUANDO UTILIZAR:
//   Qualquer token opaco com tempo de vida e armazenado por hash.
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Classes Abstratas (não instanciável diretamente).
//   - Herança (RefreshToken e TokenRecuperacao herdam dela).
//   - Polimorfismo (métodos comuns chamados sobre o tipo abstrato).
// =============================================================================
public abstract class TokenSeguro {
    protected final UUID id;
    protected final String hash;
    protected final Instant criadoEm;
    protected final Instant expiraEm;

    protected TokenSeguro(UUID id, String hash, Instant criadoEm, Instant expiraEm) {
        this.id = id;
        this.hash = hash;
        this.criadoEm = criadoEm;
        this.expiraEm = expiraEm;
    }

    public UUID getId() { return id; }
    public String getHash() { return hash; }
    public Instant getCriadoEm() { return criadoEm; }
    public Instant getExpiraEm() { return expiraEm; }

    // Método polimórfico padrão: token expirado quando o relógio passou.
    public boolean estaExpirado() {
        return Instant.now().isAfter(expiraEm);
    }

    // Subclasses precisam dizer se o token ainda é utilizável (não revogado,
    // não rotacionado, não usado).
    public abstract boolean estaValido();
}
