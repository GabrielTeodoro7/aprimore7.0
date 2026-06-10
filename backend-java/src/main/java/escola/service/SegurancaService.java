package escola.service;

import escola.exceptions.ContaBloqueadaException;
import escola.exceptions.SenhaFracaException;
import escola.exceptions.SenhaReutilizadaException;
import escola.model.AnomaliaAcesso;
import escola.model.TentativaLogin;

import java.sql.SQLException;
import java.util.UUID;

// =============================================================================
// SegurancaService — Fachada que orquestra os serviços de segurança.
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   * Reúne BloqueioService, SenhaService, AnomaliaService em uma única
//     porta de entrada para o restante da aplicação Java acadêmica.
//
// POR QUE FOI UTILIZADO:
//   * Padrão Facade — esconde dependências dos serviços internos e
//     centraliza o fluxo "tentar login → bloquear se necessário → analisar
//     anomalia → registrar".
//
// QUANDO UTILIZAR:
//   * Chamado pelo Main.java ou por outros services quando precisarem do
//     pacote completo de validações de segurança.
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Composição (vários services internos).
//   - Encapsulamento.
//   - Exceções: várias propagadas.
// =============================================================================
public class SegurancaService {

    private final BloqueioService bloqueio;
    private final SenhaService senha;
    private final AnomaliaService anomalia;

    public SegurancaService(BloqueioService bloqueio, SenhaService senha, AnomaliaService anomalia) {
        this.bloqueio = bloqueio;
        this.senha = senha;
        this.anomalia = anomalia;
    }

    // Fluxo simplificado: o chamador valida a senha (Supabase Auth), e
    // depois nos informa o resultado para enforcement adicional.
    public AnomaliaAcesso onTentativa(String email, UUID userId,
                                      boolean sucesso, String ip, String ua,
                                      String pais, String cidade)
            throws SQLException, ContaBloqueadaException {
        // Antes de tudo, recusa se já houver lock ativo.
        bloqueio.verificarLock(email);

        TentativaLogin.Motivo motivo = sucesso
                ? TentativaLogin.Motivo.OK
                : TentativaLogin.Motivo.SENHA_INCORRETA;
        bloqueio.registrarTentativa(
                new TentativaLogin(email, userId, sucesso, ip, ua, motivo));

        if (!sucesso || userId == null) return null;
        return anomalia.analisar(userId, ip, ua, pais, cidade);
    }

    public String trocarSenha(UUID userId, String senhaClara)
            throws SenhaFracaException, SenhaReutilizadaException, SQLException {
        return senha.registrarTroca(userId, senhaClara);
    }
}
