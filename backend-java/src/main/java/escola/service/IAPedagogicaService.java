package escola.service;

import escola.model.RiscoAcademico;
import escola.model.RiscoAcademico.Nivel;
import escola.model.SugestaoPedagogica;
import escola.model.SugestaoPedagogica.Prioridade;

import java.util.UUID;

/**
 * RN.56–60 — Serviço de IA pedagógica do SGE.
 *
 * Responsabilidades:
 *  - RN.56: gerar sugestões pedagógicas;
 *  - RN.57: classificar risco acadêmico;
 *  - RN.58: gerar plano de estudos individualizado (stub);
 *  - RN.59: registrar interações para auditoria;
 *  - RN.60: aplicar limites de uso para prevenir abuso.
 *
 * Conceitos didáticos: polimorfismo via sobrecarga, uso de switch sobre enum.
 */
public class IAPedagogicaService {

    private static final int LIMITE_DIARIO_PADRAO = 100;

    /** RN.57: classifica risco a partir de média e frequência. */
    public RiscoAcademico classificarRisco(UUID alunoId, double mediaGeral, double frequenciaPct) {
        Nivel nivel;
        if (mediaGeral < 4.0 || frequenciaPct < 60.0) {
            nivel = Nivel.CRITICO;
        } else if (mediaGeral < 5.0 || frequenciaPct < 70.0) {
            nivel = Nivel.ALTO;
        } else if (mediaGeral < 6.0 || frequenciaPct < 80.0) {
            nivel = Nivel.MEDIO;
        } else {
            nivel = Nivel.BAIXO;
        }
        String indicadores = String.format(
            "{\"media\":%.2f,\"frequencia\":%.2f}", mediaGeral, frequenciaPct);
        return new RiscoAcademico(alunoId, nivel, indicadores);
    }

    /** RN.56: gera sugestão pedagógica com prioridade derivada do risco. */
    public SugestaoPedagogica sugerirAcao(UUID alunoId, RiscoAcademico risco) {
        Prioridade p;
        String texto;
        switch (risco.getNivel()) {
            case CRITICO:
                p = Prioridade.ALTA;
                texto = "Conversa com responsável e plano de reforço imediato.";
                break;
            case ALTO:
                p = Prioridade.ALTA;
                texto = "Atendimento pedagógico individualizado nas próximas 2 semanas.";
                break;
            case MEDIO:
                p = Prioridade.MEDIA;
                texto = "Atividades complementares para reforço dos conteúdos.";
                break;
            default:
                p = Prioridade.BAIXA;
                texto = "Manter acompanhamento padrão.";
        }
        SugestaoPedagogica s = new SugestaoPedagogica(alunoId, texto, p);
        s.setContexto("risco=" + risco.getNivel().name());
        return s;
    }

    /** RN.60: valida limites de uso da IA (rate-limit lógico por usuário/dia). */
    public boolean dentroDoLimiteDeUso(int requisicoesHoje) {
        return requisicoesHoje < LIMITE_DIARIO_PADRAO;
    }
}
