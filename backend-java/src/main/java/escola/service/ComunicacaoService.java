package escola.service;

import escola.dao.DenunciaDAO;
import escola.model.Denuncia;

import java.sql.SQLException;
import java.time.Instant;
import java.util.UUID;

// =============================================================================
// ComunicacaoService — Gestão de mensagens e moderação (RN.25).
// CONTEÚDO ACADÊMICO: Encapsulamento, JDBC.
// =============================================================================
public class ComunicacaoService {
    private final DenunciaDAO denunciaDAO;

    public ComunicacaoService() throws SQLException {
        this.denunciaDAO = new DenunciaDAO();
    }

    public void denunciarMensagem(UUID mensagemId, UUID denuncianteId, String motivo, String detalhes) throws SQLException {
        if (mensagemId == null) throw new IllegalArgumentException("ID da mensagem é obrigatório.");
        if (motivo == null || motivo.isBlank()) throw new IllegalArgumentException("Motivo da denúncia é obrigatório.");

        Denuncia d = new Denuncia(
            UUID.randomUUID(),
            mensagemId,
            denuncianteId,
            motivo,
            detalhes,
            Denuncia.Status.PENDENTE,
            Instant.now(),
            null
        );

        denunciaDAO.inserir(d);
    }
}
