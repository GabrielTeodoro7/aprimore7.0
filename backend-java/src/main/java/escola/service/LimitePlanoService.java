package escola.service;

import escola.exceptions.LimitePlanoExcedidoException;
import escola.model.LimitePlano;
import java.util.HashMap;
import java.util.Map;

/**
 * RN.30: Limites de Plano.
 */
public class LimitePlanoService {
    private static final Map<String, LimitePlano> limites = new HashMap<>();

    static {
        limites.put("ALUNOS", new LimitePlano("ALUNOS", 500, 0));
        limites.put("TURMAS", new LimitePlano("TURMAS", 20, 0));
    }

    public void verificar(String recurso) throws LimitePlanoExcedidoException {
        LimitePlano l = limites.get(recurso.toUpperCase());
        if (l != null && !l.podeIncrementar()) {
            throw new LimitePlanoExcedidoException("Limite do plano excedido para o recurso: " + recurso);
        }
    }
    
    public void registrarUso(String recurso, int atual) {
        LimitePlano l = limites.get(recurso.toUpperCase());
        if (l != null) l.setUsoAtual(atual);
    }
}
