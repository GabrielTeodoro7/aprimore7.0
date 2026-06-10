package escola.service;

import escola.util.Log;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.logging.Logger;

// =====================================================================
// ONDA B.3 — LGPD (RN.31)
// Soft Delete com preservação de histórico. Em vez de excluir fisicamente
// um registro, marca-se a coluna `deletado_em` com o instante atual.
// Os SELECTs padrão filtram `WHERE deletado_em IS NULL`.
// ---------------------------------------------------------------------
// Conteúdo acadêmico aplicado:
//  - Genéricos (<T extends SoftDeletavel>)   // tipagem genérica
//  - Interface (SoftDeletavel)               // polimorfismo
//  - Polimorfismo via interface              // múltiplos modelos podem ser deletados
// =====================================================================
public class SoftDeleteService {
    private static final Logger LOG = Log.get(SoftDeleteService.class);

    // // INTERFACE — qualquer modelo que possa sofrer soft delete deve implementar
    public interface SoftDeletavel {
        UUID getId();
        LocalDateTime getDeletadoEm();
        void setDeletadoEm(LocalDateTime t);
    }

    /**
     * Marca o registro como deletado (preserva histórico para auditoria
     * e relatórios pedagógicos posteriores).
     *
     * Uso de genéricos: o mesmo método serve para Aluno, Turma, Atividade
     * etc., desde que implementem SoftDeletavel.
     */
    public <T extends SoftDeletavel> T excluirLogicamente(T entidade, UUID actorId) {
        if (entidade == null) {
            throw new IllegalArgumentException("Entidade não pode ser nula");
        }
        if (entidade.getDeletadoEm() != null) {
            LOG.warning("Entidade " + entidade.getId() + " já estava deletada.");
            return entidade;
        }
        entidade.setDeletadoEm(LocalDateTime.now());
        LOG.info("Soft delete aplicado por " + actorId
                + " na entidade " + entidade.getId()
                + " (" + entidade.getClass().getSimpleName() + ")");
        return entidade;
    }

    /** Reverte o soft delete (restauração). */
    public <T extends SoftDeletavel> T restaurar(T entidade, UUID actorId) {
        if (entidade == null) {
            throw new IllegalArgumentException("Entidade não pode ser nula");
        }
        entidade.setDeletadoEm(null);
        LOG.info("Restauração aplicada por " + actorId
                + " na entidade " + entidade.getId());
        return entidade;
    }
}
