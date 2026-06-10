package escola.model;

import java.time.Instant;
import java.util.UUID;

// =============================================================================
// AnomaliaAcesso — Evento de acesso fora do padrão (RN.61).
// CONTEÚDOS ACADÊMICOS: POJO + ENUM aninhado (Gravidade).
// =============================================================================
public class AnomaliaAcesso {
    // ENUM dentro da classe representa categorias bem definidas.
    // CONTEÚDO ACADÊMICO: Enum em Java.
    public enum Gravidade { BAIXA, MEDIA, ALTA }
    public enum Tipo {
        NOVO_DISPOSITIVO,
        NOVO_PAIS,
        HORARIO_ATIPICO,
        VELOCIDADE_IMPOSSIVEL
    }

    private final UUID id;
    private final UUID userId;
    private final Tipo tipo;
    private final Gravidade gravidade;
    private final String ip;
    private final String userAgent;
    private final String pais;
    private final String cidade;
    private final boolean notificado;
    private final boolean reconhecido;
    private final Instant criadoEm;

    public AnomaliaAcesso(UUID id, UUID userId, Tipo tipo, Gravidade gravidade,
                          String ip, String userAgent, String pais, String cidade,
                          boolean notificado, boolean reconhecido, Instant criadoEm) {
        this.id = id;
        this.userId = userId;
        this.tipo = tipo;
        this.gravidade = gravidade;
        this.ip = ip;
        this.userAgent = userAgent;
        this.pais = pais;
        this.cidade = cidade;
        this.notificado = notificado;
        this.reconhecido = reconhecido;
        this.criadoEm = criadoEm;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public Tipo getTipo() { return tipo; }
    public Gravidade getGravidade() { return gravidade; }
    public String getIp() { return ip; }
    public String getUserAgent() { return userAgent; }
    public String getPais() { return pais; }
    public String getCidade() { return cidade; }
    public boolean isNotificado() { return notificado; }
    public boolean isReconhecido() { return reconhecido; }
    public Instant getCriadoEm() { return criadoEm; }
}
