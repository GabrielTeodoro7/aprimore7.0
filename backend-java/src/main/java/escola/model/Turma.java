package escola.model;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

// Turma agrega Alunos (Coleções — Set evita aluno duplicado).
/**
 * O QUE: Representa uma Turma.
 * POR QUE: Agrega Alunos e define o Professor Regente (RN.12).
 * CONTEÚDO ACADÊMICO: Coleções, Encapsulamento, Relacionamento entre classes.
 */
public class Turma {
    private UUID id;
    private final String nome;
    private final Set<Aluno> alunos = new HashSet<>();
    private final List<Disciplina> disciplinas = new ArrayList<>();
    private UUID professorRegenteId;
    private UUID turnoId;

    public Turma(String nome) { this.nome = nome; }
    public Turma(String nome, UUID turnoId) { 
        this.nome = nome; 
        this.turnoId = turnoId;
    }

    public void matricular(Aluno a) { alunos.add(a); }
    public void adicionarDisciplina(Disciplina d) { disciplinas.add(d); }

    public String getNome() { return nome; }
    public Set<Aluno> getAlunos() { return alunos; }
    public List<Disciplina> getDisciplinas() { return disciplinas; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProfessorRegenteId() { return professorRegenteId; }
    public void setProfessorRegenteId(UUID professorRegenteId) { this.professorRegenteId = professorRegenteId; }
    public UUID getTurnoId() { return turnoId; }
    public void setTurnoId(UUID turnoId) { this.turnoId = turnoId; }

    public double mediaTurma() {
        return alunos.stream().mapToDouble(Aluno::getNotaMedia).average().orElse(0);
    }
}
