package escola.service;

import escola.util.Log;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Logger;

// =====================================================================
// ONDA B.1 — LGPD (RN.46)
// Relatório de Impacto à Proteção de Dados (RIPD), gerado trimestralmente.
// Esta classe consolida métricas; a geração de PDF é responsabilidade da
// camada de aplicação (reutiliza RelatorioPDFService quando possível).
// =====================================================================
public class RipdService {
    private static final Logger LOG = Log.get(RipdService.class);

    /** Retorna o trimestre (1-4) correspondente a uma data. */
    public int trimestreDe(LocalDate data) {
        return (data.getMonthValue() - 1) / 3 + 1;
    }

    /** Agrega indicadores básicos do trimestre. */
    public Map<String, Object> agregarTrimestre(int ano, int trimestre,
                                                int totalConsentimentos,
                                                int totalRevogacoes,
                                                int totalExportacoes,
                                                int totalAcessosSensiveis,
                                                int totalIncidentes) {
        if (trimestre < 1 || trimestre > 4) {
            throw new IllegalArgumentException("trimestre deve estar entre 1 e 4");
        }
        Map<String, Object> resumo = new LinkedHashMap<>();
        resumo.put("ano", ano);
        resumo.put("trimestre", trimestre);
        resumo.put("periodo", periodoLegivel(ano, trimestre));
        resumo.put("consentimentos", totalConsentimentos);
        resumo.put("revogacoes", totalRevogacoes);
        resumo.put("exportacoes", totalExportacoes);
        resumo.put("acessos_sensiveis", totalAcessosSensiveis);
        resumo.put("incidentes", totalIncidentes);
        LOG.info("RIPD agregado " + ano + "T" + trimestre);
        return resumo;
    }

    private String periodoLegivel(int ano, int trimestre) {
        int mesInicio = (trimestre - 1) * 3 + 1;
        YearMonth ini = YearMonth.of(ano, mesInicio);
        YearMonth fim = ini.plusMonths(2);
        return ini + " a " + fim;
    }
}
