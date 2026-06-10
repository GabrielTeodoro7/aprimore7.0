package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// TentativaLogin — Registro auditável de cada tentativa de login (RN.02 / RN.61).
// CONTEÚDO ACADÊMICO: Classes e Objetos; Construtores sobrecarregados (sucesso/falha).
// =============================================================================
public class TentativaLogin {
    public enum Motivo { OK, SENHA_INCORRETA, CONTA_BLOQUEADA, USUARIO_INEXISTENTE, OUTRO }

    private final UUID id;
    private final String email;
    private final UUID userId;          // pode ser null se usuário inexistente
    private final boolean sucesso;
    private final String ip;
    private final String userAgent;
    private final Motivo motivo;
    private final Instant criadoEm;

    public TentativaLogin(UUID id, String email, UUID userId, boolean sucesso,
                          String ip, String userAgent, Motivo motivo, Instant criadoEm) {
        this.id = id;
        this.email = email;
        this.userId = userId;
        this.sucesso = sucesso;
        this.ip = ip;
        this.userAgent = userAgent;
        this.motivo = motivo;
        this.criadoEm = criadoEm;
    }

    // Atalho para tentativa nova (id e timestamp gerados).
    // CONTEÚDO ACADÊMICO: Construtor sobrecarregado (this(...)).
    public TentativaLogin(String email, UUID userId, boolean sucesso,
                          String ip, String userAgent, Motivo motivo) {
        this(UUID.randomUUID(), email, userId, sucesso, ip, userAgent, motivo, Instant.now());
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public UUID getUserId() { return userId; }
    public boolean isSucesso() { return sucesso; }
    public String getIp() { return ip; }
    public String getUserAgent() { return userAgent; }
    public Motivo getMotivo() { return motivo; }
    public Instant getCriadoEm() { return criadoEm; }
}
