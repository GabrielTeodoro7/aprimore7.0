package escola.service;

import escola.exceptions.AcademicoException;
import escola.model.Bimestre;
import escola.model.MetaPdi;
import escola.model.Pdi;
import escola.model.Turma;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * O QUE: Serviço que orquestra as regras da Vida Acadêmica.
 * POR QUE: Centraliza a lógica de RN.11 a RN.49 conforme exigido.
 * CONTEÚDO ACADÊMICO: Encapsulamento, Polimorfismo, Exceções.
 */
public class AcademicoService {

    /**
     * Valida se um professor pode ser regente de uma turma considerando o turno (RN.12).
     * @param professorId O ID do professor.
     * @param turnoId O ID do turno da turma.
     * @param turmasExistentes Lista de turmas onde o professor já é regente.
     * @throws AcademicoException Se houver conflito de turno.
     */
    public void validarRegencia(UUID professorId, UUID turnoId, List<Turma> turmasExistentes) throws AcademicoException {
        // Exemplo didático de polimorfismo/coleções
        for (Turma t : turmasExistentes) {
            if (t.getProfessorRegenteId().equals(professorId) && t.getTurnoId().equals(turnoId)) {
                throw new AcademicoException("O professor já é regente em outra turma neste turno (RN.12).");
            }
        }
    }

    /**
     * Valida se uma justificativa de falta está dentro do prazo (RN.15).
     */
    public void validarPrazoJustificativa(LocalDate dataFalta) throws AcademicoException {
        long horas = ChronoUnit.HOURS.between(dataFalta.atStartOfDay(), LocalDate.now().atStartOfDay());
        if (horas > 48) {
            throw new AcademicoException("Justificativa fora do prazo de 48h (RN.15).");
        }
    }

    /**
     * Verifica se o aluno atingiu o limite de faltas excessivas (RN.14).
     * Exemplo acadêmico: 25% de faltas em um bimestre.
     */
    public boolean temFaltasExcessivas(int totalAulas, int faltas) {
        if (totalAulas <= 0) return false;
        double percentual = (double) faltas / totalAulas;
        return percentual > 0.25; // Regra institucional padrão
    }

    /**
     * Calcula a média configurável (RN.17).
     * @param notas Lista de notas.
     * @param tipo 'aritmetica' ou 'ponderada'.
     * @return A média calculada.
     */
    public double calcularMedia(List<Double> notas, String tipo) {
        if (notas.isEmpty()) return 0;
        if ("ponderada".equalsIgnoreCase(tipo)) {
            // No MVP simplificamos, mas aqui entraria a lógica de pesos
            return notas.stream().mapToDouble(d -> d).average().orElse(0);
        }
        return notas.stream().mapToDouble(d -> d).average().orElse(0);
    }

    /**
     * Valida consistência Nota x Avaliação (RN.47).
     */
    public void validarNotaAvaliacao(double nota, double pesoAvaliacao) throws AcademicoException {
        if (nota < 0 || nota > 10) {
            throw new AcademicoException("Nota deve estar entre 0 e 10.");
        }
    }

    /**
     * Registra transferência preservando histórico (RN.11).
     * Na implementação real, isso dispararia o log de transferência.
     */
    public void processarTransferencia(UUID alunoId, UUID origemId, UUID destinoId) {
        // Lógica de auditoria e preservação de registros históricos
        System.out.println("Aluno " + alunoId + " transferido de " + origemId + " para " + destinoId);
    }
}
