package escola.threads;

import escola.interfaces.Relatorio;
import escola.model.Aluno;

import java.util.List;

// =====================================================================
// TÓPICO 12 — THREAD
// Geração do relatório roda em uma Thread separada para não bloquear
// o fluxo principal (Runnable + Thread.start()).
// =====================================================================
public class ProcessadorRelatorios implements Runnable {

    private final Relatorio relatorio;          // TÓPICO 5 (Interface) e TÓPICO 7 (Polimorfismo)
    private final List<Aluno> alunos;           // TÓPICO 8 (Coleções)
    private final String caminho;

    public ProcessadorRelatorios(Relatorio relatorio, List<Aluno> alunos, String caminho) {
        this.relatorio = relatorio;
        this.alunos = alunos;
        this.caminho = caminho;
    }

    @Override
    public void run() {
        try {
            System.out.println("[Thread] Gerando relatório " + relatorio.getFormato() + "...");
            relatorio.gerar(alunos, caminho);
            System.out.println("[Thread] Relatório salvo em " + caminho);
        } catch (Exception e) {
            // TÓPICO 11 — EXCEÇÕES (tratamento dentro da thread)
            System.err.println("[Thread] Falha ao gerar relatório: " + e.getMessage());
        }
    }
}
