package escola.service;

import escola.exceptions.DominioNaoAutorizadoException;

import java.util.HashSet;
import java.util.Set;

// =============================================================================
// DominioInstitucionalService — Whitelist em memória (RN.35).
// CONTEÚDOS ACADÊMICOS: Coleções (Set/HashSet), Encapsulamento, Exceções.
// =============================================================================
public class DominioInstitucionalService {
    private final Set<String> dominiosObrigatorios = new HashSet<>();
    private boolean modoObrigatorio = false;

    public void registrarDominio(String dominio) {
        dominiosObrigatorios.add(dominio.toLowerCase());
    }

    public void setModoObrigatorio(boolean v) { this.modoObrigatorio = v; }

    public void validar(String email) throws DominioNaoAutorizadoException {
        if (!modoObrigatorio || dominiosObrigatorios.isEmpty()) return;
        int at = email.indexOf('@');
        String dominio = at >= 0 ? email.substring(at + 1).toLowerCase() : "";
        if (!dominiosObrigatorios.contains(dominio)) {
            throw new DominioNaoAutorizadoException(dominio);
        }
    }
}
