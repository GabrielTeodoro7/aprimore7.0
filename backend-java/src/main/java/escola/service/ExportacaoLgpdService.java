package escola.service;

import escola.util.Log;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

// =====================================================================
// ONDA B.1 — LGPD (RN.34)
// Exportação/portabilidade dos dados do titular. Esta classe orquestra
// a montagem do "pacote" (mapa nome->conteúdo) que será serializado em
// JSON+CSV e depositado em Storage privado (bucket lgpd-exports) pela
// camada de aplicação. Mantém-se desacoplada do provedor (S3/Supabase).
// =====================================================================
public class ExportacaoLgpdService {
    private static final Logger LOG = Log.get(ExportacaoLgpdService.class);

    /** Validade do link assinado em dias (RN.34 = 7). */
    public static final int VALIDADE_LINK_DIAS = 7;

    /** Monta o pacote a ser exportado para um titular. */
    public Map<String, Object> montarPacote(UUID profileId, Map<String, Object> dadosBrutos) {
        Map<String, Object> pacote = new LinkedHashMap<>();
        pacote.put("profile_id", profileId.toString());
        pacote.put("gerado_em", LocalDateTime.now().toString());
        pacote.put("validade_dias", VALIDADE_LINK_DIAS);
        pacote.put("dados", dadosBrutos);
        LOG.info("Pacote LGPD montado para profile " + profileId
                + " (" + dadosBrutos.size() + " seções)");
        return pacote;
    }

    public LocalDateTime expiracaoPadrao() {
        return LocalDateTime.now().plusDays(VALIDADE_LINK_DIAS);
    }
}
