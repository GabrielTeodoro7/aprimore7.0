package escola.service;

import escola.model.Aluno;
import escola.util.Log;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

// =====================================================================
// ONDA B.1 — LGPD (RN.32)
// Anonimização de dados pessoais após o prazo legal de retenção
// (5 anos a partir de data_desligamento). O cálculo é determinístico;
// a aplicação efetiva no banco é feita pela camada de persistência.
// =====================================================================
public class AnonimizacaoService {
    private static final Logger LOG = Log.get(AnonimizacaoService.class);

    /** Prazo legal de retenção em anos. RN.32 = 5. */
    public static final int ANOS_RETENCAO = 5;

    /** RN.32 — true se já decorreu o prazo de retenção desde o desligamento. */
    public boolean deveAnonimizar(LocalDate dataDesligamento, LocalDate hoje) {
        if (dataDesligamento == null) return false;
        Period p = Period.between(dataDesligamento, hoje);
        return p.getYears() >= ANOS_RETENCAO;
    }

    /**
     * Anonimiza um Aluno em memória — substitui PII por valores irreversíveis
     * (hash determinístico do id). Mantém estatísticas de notas/frequência.
     */
    public Aluno anonimizar(Aluno a) {
        String pseudo = "ANON-" + Integer.toHexString(a.getMatricula().hashCode());
        Aluno anonimo = new Aluno(pseudo, "00000000000", pseudo, a.getNotaMedia());
        LOG.info("Aluno anonimizado: " + a.getMatricula() + " -> " + pseudo);
        return anonimo;
    }

    /** Aplica anonimização em lote. */
    public List<Aluno> anonimizarLote(List<Aluno> alunos) {
        List<Aluno> out = new ArrayList<>();
        for (Aluno a : alunos) out.add(anonimizar(a));
        return out;
    }
}
