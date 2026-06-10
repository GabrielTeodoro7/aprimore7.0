package escola.interfaces;

import java.io.IOException;
import java.util.List;
import escola.model.Aluno;

// =====================================================================
// TÓPICO 5 — INTERFACES
// Contrato que qualquer gerador de relatório precisa cumprir.
// Implementado por service/RelatorioPDFService.java.
// =====================================================================
public interface Relatorio {
    void gerar(List<Aluno> alunos, String caminhoSaida) throws IOException;
    String getFormato();
}
