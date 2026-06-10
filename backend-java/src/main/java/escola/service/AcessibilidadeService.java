package escola.service;

import escola.dao.PreferenciaAcessibilidadeDAO;
import escola.model.PreferenciaAcessibilidade;

import java.sql.SQLException;
import java.time.Instant;
import java.util.UUID;

// =============================================================================
// AcessibilidadeService — Regras de negócio para inclusão digital (RN.37).
// CONTEÚDO ACADÊMICO: Tratamento de exceções, Lógica de serviço.
// =============================================================================
public class AcessibilidadeService {
    private final PreferenciaAcessibilidadeDAO dao;

    public AcessibilidadeService() throws SQLException {
        this.dao = new PreferenciaAcessibilidadeDAO();
    }

    public void sincronizarPreferencias(UUID userId, boolean altoContraste, boolean fonteAmpliada, 
                                        boolean leituraTela, boolean atalhosTeclado, String daltonismo) throws SQLException {
        if (userId == null) throw new IllegalArgumentException("Usuário não identificado.");
        
        PreferenciaAcessibilidade p = new PreferenciaAcessibilidade(
            userId, altoContraste, fonteAmpliada, leituraTela, atalhosTeclado,
            PreferenciaAcessibilidade.Daltonismo.valueOf(daltonismo.toUpperCase()),
            Instant.now()
        );
        
        dao.upsert(p);
    }

    public PreferenciaAcessibilidade obterPreferencias(UUID userId) throws SQLException {
        return dao.buscarPorUsuario(userId)
                .orElse(new PreferenciaAcessibilidade(userId, false, false, false, true, 
                        PreferenciaAcessibilidade.Daltonismo.NENHUM, Instant.now()));
    }
}
