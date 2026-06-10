package escola.service;

import java.util.List;
import java.util.ArrayList;

/**
 * RN.56-60: Simulação de processamento de IA no Backend Java.
 * Conteúdo Acadêmico: Polimorfismo e Coleções.
 */
public class IAService {

    /**
     * Analisa tendências de desempenho.
     * @param notas Lista de notas do aluno.
     * @return String com a análise.
     */
    public String analisarTendencia(List<Double> notas) {
        if (notas == null || notas.isEmpty()) return "Dados insuficientes.";
        
        double soma = 0;
        for (Double nota : notas) soma += nota;
        double media = soma / notas.size();

        // Lógica simples de "predição" acadêmica
        if (media > 8.0) return "Tendência de excelência. Sugerir atividades de monitoria.";
        if (media < 5.0) return "Risco acadêmico detectado. Priorizar reforço.";
        return "Desempenho estável.";
    }
}
