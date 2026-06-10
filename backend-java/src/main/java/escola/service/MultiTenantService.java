package escola.service;

import escola.model.Escola;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * RN.41, 42, 43: Isolamento de dados multi-escola.
 */
public class MultiTenantService {
    private static final Map<UUID, Escola> contextoEscola = new HashMap<>();

    public static void setEscolaAtual(Escola escola) {
        contextoEscola.put(UUID.randomUUID(), escola); // Simulação de ThreadLocal ou Contexto
    }

    public static UUID getEscolaId(UUID contextId) {
        Escola e = contextoEscola.get(contextId);
        return e != null ? e.getId() : null;
    }
}
