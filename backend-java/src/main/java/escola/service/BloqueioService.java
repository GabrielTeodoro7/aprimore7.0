package escola.service;

import escola.dao.BloqueioContaDAO;
import escola.dao.TentativaLoginDAO;
import escola.exceptions.ContaBloqueadaException;
import escola.model.Bloqueio;
import escola.model.PoliticaSenha;
import escola.model.TentativaLogin;

import java.sql.SQLException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

// =============================================================================
// BloqueioService — Política de bloqueio progressivo (RN.02).
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   * Recebe o resultado (sucesso/falha) de cada tentativa.
//   * Quando o número de falhas dentro da janela ultrapassa o máximo,
//     cria um Bloqueio com janela exponencial (15, 30, 60, 120 minutos…).
//   * Antes de cada nova tentativa, expõe `verificarLock(email)` que
//     lança ContaBloqueadaException se o e-mail estiver com lock vigente.
//
// POR QUE FOI UTILIZADO:
//   * Defesa contra força bruta sem bloquear definitivamente (UX).
//   * Auditável: cada evento fica em `tentativas_login` e cada lock em
//     `bloqueios_conta`.
//
// QUANDO UTILIZAR:
//   * No início e no fim de cada fluxo de login.
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Threads / Concorrência (ReentrantLock para evitar criação dupla
//     de bloqueio em multi-thread).
//   - Exceções customizadas.
//   - Optional<T>.
//   - Coleções (indiretamente via DAO).
// =============================================================================
public class BloqueioService {

    private final PoliticaSenha politica;
    private final TentativaLoginDAO tentativaDao;
    private final BloqueioContaDAO bloqueioDao;

    // ReentrantLock protege a seção crítica "verifica falhas → cria bloqueio".
    // CONTEÚDO ACADÊMICO: Thread + sincronização explícita.
    private final ReentrantLock lock = new ReentrantLock();

    public BloqueioService(PoliticaSenha politica,
                           TentativaLoginDAO tentativaDao,
                           BloqueioContaDAO bloqueioDao) {
        this.politica = politica;
        this.tentativaDao = tentativaDao;
        this.bloqueioDao = bloqueioDao;
    }

    // ------------------------------------------------------------------------
    // verificarLock(): chamado antes de cada tentativa. Lança se ativo.
    // ------------------------------------------------------------------------
    public void verificarLock(String email)
            throws SQLException, ContaBloqueadaException {
        Optional<Bloqueio> b = bloqueioDao.ativoPorEmail(email);
        if (b.isPresent() && b.get().estaAtivo()) {
            throw new ContaBloqueadaException(b.get().minutosRestantes());
        }
    }

    // ------------------------------------------------------------------------
    // registrarTentativa(): grava em tentativas_login. Quando falha e o
    // total recente ultrapassa o limite, cria um bloqueio.
    // ------------------------------------------------------------------------
    public void registrarTentativa(TentativaLogin t) throws SQLException {
        tentativaDao.inserir(t);
        if (t.isSucesso()) return;

        lock.lock();
        try {
            int falhas = tentativaDao.contarFalhasRecentes(
                    t.getEmail(), politica.getJanelaLockMin());
            if (falhas >= politica.getMaxTentativas()) {
                Instant agora = Instant.now();
                // Janela exponencial: base * 2^(blocos-1) min, com teto de 24h.
                long minutos = Math.min(
                        24L * 60L,
                        (long) politica.getJanelaLockMin()
                                * (1L << Math.min(5, falhas - politica.getMaxTentativas())));
                Bloqueio b = new Bloqueio(
                        UUID.randomUUID(),
                        t.getUserId(),
                        t.getEmail(),
                        agora,
                        agora.plus(minutos, ChronoUnit.MINUTES),
                        falhas,
                        "tentativas_excessivas",
                        false);
                bloqueioDao.inserir(b);
            }
        } finally {
            lock.unlock();
        }
    }
}
