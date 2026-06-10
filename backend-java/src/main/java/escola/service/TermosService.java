package escola.service;

import escola.exceptions.TermosNaoAceitosException;
import escola.model.DocumentoLegal;
import escola.model.TermoAceito;
import escola.util.Log;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

// =====================================================================
// ONDA B.1 — LGPD (RN.05)
// Camada de negócio para Termos de Uso / Política de Privacidade.
// Persistência efetiva mora no banco; esta classe mantém o cache em
// memória e expõe as regras de negócio (versão vigente, aceite, etc.).
// =====================================================================
public class TermosService {
    private static final Logger LOG = Log.get(TermosService.class);

    private final Map<UUID, DocumentoLegal> documentos = new HashMap<>();
    private final List<TermoAceito> aceites = new ArrayList<>();

    public void registrarDocumento(DocumentoLegal doc) {
        Objects.requireNonNull(doc, "documento");
        documentos.put(doc.getId(), doc);
        LOG.info("Documento legal registrado: " + doc.getTipo() + " v" + doc.getVersao());
    }

    /** Retorna a versão vigente (mais recente por vigenteEm) para um tipo. */
    public Optional<DocumentoLegal> versaoVigente(DocumentoLegal.Tipo tipo) {
        return documentos.values().stream()
                .filter(d -> d.getTipo() == tipo)
                .max((a, b) -> a.getVigenteEm().compareTo(b.getVigenteEm()));
    }

    /** RN.05 — registra aceite imutável de um documento por um usuário. */
    public TermoAceito aceitar(UUID profileId, UUID documentoId, String ip, String userAgent) {
        if (!documentos.containsKey(documentoId)) {
            throw new IllegalArgumentException("Documento legal inexistente: " + documentoId);
        }
        TermoAceito t = new TermoAceito(
                UUID.randomUUID(), profileId, documentoId,
                LocalDateTime.now(), ip, userAgent);
        aceites.add(t);
        LOG.info("Aceite registrado: profile=" + profileId + " doc=" + documentoId);
        return t;
    }

    /** RN.05 — exige que o usuário tenha aceito a versão vigente. */
    public void exigirAceiteVigente(UUID profileId, DocumentoLegal.Tipo tipo)
            throws TermosNaoAceitosException {
        Optional<DocumentoLegal> vigente = versaoVigente(tipo);
        if (vigente.isEmpty() || !vigente.get().isObrigatorio()) return;
        UUID docId = vigente.get().getId();
        boolean aceitou = aceites.stream()
                .anyMatch(a -> a.getProfileId().equals(profileId) && a.getDocumentoId().equals(docId));
        if (!aceitou) {
            throw new TermosNaoAceitosException(vigente.get().getVersao());
        }
    }

    public List<TermoAceito> aceitesDoUsuario(UUID profileId) {
        List<TermoAceito> out = new ArrayList<>();
        for (TermoAceito a : aceites) {
            if (a.getProfileId().equals(profileId)) out.add(a);
        }
        return out;
    }
}
