package escola.service;

import escola.util.Log;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.logging.Logger;

// =====================================================================
// ONDA B.3 — LGPD (RN.63)
// Registro de acesso a dados sensíveis com justificativa obrigatória.
// Cada acesso a um campo sensível (CPF, nota individual etc.) gera uma
// entrada imutável em logs_acesso_sensiveis.
// ---------------------------------------------------------------------
// Conteúdo acadêmico aplicado:
//  - Enums (Campo, Severidade)               // demonstrando enumerações
//  - POJO/Encapsulamento (RegistroAcesso)   // getters/setters privados
//  - Tratamento de exceções                  // IllegalArgumentException
// =====================================================================
public class LogAcessoSensivelService {
    private static final Logger LOG = Log.get(LogAcessoSensivelService.class);

    // // ENUM — conteúdo acadêmico (tipos finitos e seguros em compile-time)
    public enum Campo { CPF, NOTA_INDIVIDUAL, ENDERECO, TELEFONE, OUTRO }

    // // POJO imutável: representa o registro a ser persistido
    public static final class RegistroAcesso {
        private final UUID actorId;
        private final UUID alunoId;
        private final Campo campo;
        private final String justificativa;
        private final boolean contextoNormal;
        private final LocalDateTime quando;

        public RegistroAcesso(UUID actorId, UUID alunoId, Campo campo,
                              String justificativa, boolean contextoNormal) {
            this.actorId = actorId;
            this.alunoId = alunoId;
            this.campo = campo;
            this.justificativa = justificativa;
            this.contextoNormal = contextoNormal;
            this.quando = LocalDateTime.now();
        }
        public UUID getActorId() { return actorId; }
        public UUID getAlunoId() { return alunoId; }
        public Campo getCampo() { return campo; }
        public String getJustificativa() { return justificativa; }
        public boolean isContextoNormal() { return contextoNormal; }
        public LocalDateTime getQuando() { return quando; }
    }

    /**
     * Valida e devolve um registro pronto para persistência.
     * RN.63 exige justificativa textual com no mínimo 10 caracteres.
     */
    public RegistroAcesso registrar(UUID actorId, UUID alunoId, Campo campo,
                                    String justificativa, boolean contextoNormal) {
        // // Tratamento de exceções: justificativa obrigatória
        if (justificativa == null || justificativa.trim().length() < 10) {
            throw new IllegalArgumentException(
                "Justificativa obrigatória (mínimo 10 caracteres) — RN.63"
            );
        }
        RegistroAcesso r = new RegistroAcesso(actorId, alunoId, campo,
                justificativa.trim(), contextoNormal);
        LOG.info("Acesso sensível registrado: actor=" + actorId
                + " aluno=" + alunoId + " campo=" + campo
                + " contexto_normal=" + contextoNormal);
        return r;
    }
}
