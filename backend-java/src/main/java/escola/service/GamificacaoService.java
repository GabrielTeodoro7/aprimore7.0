package escola.service;

import escola.model.Selo;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * RN.51, 52: Sistema de gamificação e engajamento.
 */
public class GamificacaoService {
    public void atribuirSelo(UUID alunoId, Selo selo) {
        System.out.println("Atribuindo selo " + selo.getNome() + " para o aluno " + alunoId);
        // Persistência via JDBC DAO (omitido para brevidade no exemplo)
    }

    public List<Selo> listarSelosDisponiveis() {
        return new ArrayList<>();
    }
}
