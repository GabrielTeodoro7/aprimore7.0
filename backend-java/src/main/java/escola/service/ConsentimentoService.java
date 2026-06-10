package escola.service;

import escola.exceptions.ConsentimentoAusenteException;
import escola.model.Consentimento;
import escola.util.Log;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

// =====================================================================
// ONDA B.1 — LGPD (RN.45)
// Consentimento granular por finalidade. Cada par (profileId, finalidade)
// é único; conceder/revogar atualiza o registro em vez de inserir novo.
// =====================================================================
public class ConsentimentoService {
    private static final Logger LOG = Log.get(ConsentimentoService.class);

    /** key = profileId + "::" + finalidade */
    private final Map<String, Consentimento> cache = new HashMap<>();

    private String chave(UUID profileId, Consentimento.Finalidade f) {
        return profileId.toString() + "::" + f.name();
    }

    public Consentimento conceder(UUID profileId, Consentimento.Finalidade f) {
        Consentimento c = cache.get(chave(profileId, f));
        if (c == null) {
            c = new Consentimento(UUID.randomUUID(), profileId, f, true, LocalDateTime.now(), null);
            cache.put(chave(profileId, f), c);
        } else {
            c.conceder();
        }
        LOG.info("Consentimento concedido: " + profileId + " / " + f);
        return c;
    }

    public Consentimento revogar(UUID profileId, Consentimento.Finalidade f) {
        Consentimento c = cache.get(chave(profileId, f));
        if (c == null) {
            c = new Consentimento(UUID.randomUUID(), profileId, f, false, null, LocalDateTime.now());
            cache.put(chave(profileId, f), c);
        } else {
            c.revogar();
        }
        LOG.info("Consentimento revogado: " + profileId + " / " + f);
        return c;
    }

    public boolean possui(UUID profileId, Consentimento.Finalidade f) {
        Consentimento c = cache.get(chave(profileId, f));
        return c != null && c.isConcedido();
    }

    /** Lança exceção se o consentimento para a finalidade não estiver concedido. */
    public void exigir(UUID profileId, Consentimento.Finalidade f) throws ConsentimentoAusenteException {
        if (!possui(profileId, f)) {
            throw new ConsentimentoAusenteException(f.name());
        }
    }

    public List<Consentimento> listar(UUID profileId) {
        List<Consentimento> out = new ArrayList<>();
        for (Consentimento c : cache.values()) {
            if (c.getProfileId().equals(profileId)) out.add(c);
        }
        return out;
    }
}
