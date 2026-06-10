package escola.service;

import escola.model.FilaSincronizacao;
import escola.model.FilaSincronizacao.Status;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * RN.53/54 — Serviço de sincronização offline e resiliência.
 *
 * Conceitos didáticos demonstrados:
 *  - Coleção genérica (List&lt;FilaSincronizacao&gt;);
 *  - Tratamento de exceções com try/catch;
 *  - Iteração com for-each;
 *  - Política simples de retry (até 3 tentativas).
 */
public class SincronizacaoOfflineService {

    private static final int MAX_TENTATIVAS = 3;

    private final List<FilaSincronizacao> fila = new ArrayList<>();

    public void enfileirar(FilaSincronizacao item) {
        fila.add(item);
    }

    /**
     * Processa todos os itens pendentes da fila.
     * Itens que falharem além do limite são marcados como ERRO (RN.54).
     */
    public int processarPendentes() {
        int processados = 0;
        for (FilaSincronizacao item : fila) {
            if (item.getStatus() != Status.PENDENTE) continue;
            try {
                aplicar(item);
                item.setStatus(Status.PROCESSADO);
                processados++;
            } catch (Exception e) {
                item.incrementarTentativas();
                item.setErro(e.getMessage());
                if (item.getTentativas() >= MAX_TENTATIVAS) {
                    item.setStatus(Status.ERRO);
                }
            }
        }
        return processados;
    }

    private void aplicar(FilaSincronizacao item) {
        // Em produção: delegaria ao DAO correspondente conforme item.getEntidade().
        // Aqui mantemos um stub didático.
        if (item.getEntidade() == null || item.getEntidade().isBlank()) {
            throw new IllegalArgumentException("Entidade obrigatória");
        }
    }

    public List<FilaSincronizacao> listarErros() {
        List<FilaSincronizacao> erros = new ArrayList<>();
        for (FilaSincronizacao i : fila) {
            if (i.getStatus() == Status.ERRO) erros.add(i);
        }
        return erros;
    }

    public List<FilaSincronizacao> listarPorUsuario(UUID userId) {
        List<FilaSincronizacao> result = new ArrayList<>();
        for (FilaSincronizacao i : fila) {
            if (userId.equals(i.getUserId())) result.add(i);
        }
        return result;
    }
}
