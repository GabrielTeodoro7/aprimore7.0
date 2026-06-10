package escola;

import escola.dao.AlunoDAO;
import escola.interfaces.Relatorio;
import escola.model.Aluno;
import escola.model.Disciplina;
import escola.model.Pessoa;
import escola.model.Professor;
import escola.model.Turma;
import escola.service.MatriculaService;
import escola.service.RelatorioCSVService;
import escola.service.RelatorioPDFService;
import escola.threads.ProcessadorRelatorios;
import escola.util.Config;
import escola.util.Log;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

public class Main {
    private static final Logger LOG = Log.get(Main.class);

    public static void main(String[] args) throws Exception {

        // Modelos (Classes/Objetos, Construtores, Herança, Polimorfismo)
        Aluno a1 = new Aluno("Ana Souza",  "111", "2024001", 8.5);
        Aluno a2 = new Aluno("Bruno Lima", "222", "2024002", 7.2);
        Professor p1 = new Professor("Carla Dias", "333", "Matemática");

        Turma t = new Turma("3º Ano A");
        t.matricular(a1); t.matricular(a2);
        t.adicionarDisciplina(new Disciplina("MAT01", "Matemática", 80));

        List<Pessoa> pessoas = new ArrayList<>(List.of(a1, a2, p1));
        pessoas.forEach(p -> LOG.info(p.apresentar()));
        LOG.info("Média da turma: " + t.mediaTurma());

        // Camada de serviço + JDBC
        AlunoDAO dao = new AlunoDAO();
        MatriculaService matricula = new MatriculaService(dao);
        try { matricula.matricular(a1); matricula.matricular(a2); }
        catch (Exception e) { LOG.warning("Erro JDBC: " + e.getMessage()); }
        List<Aluno> doBanco = matricula.todos();

        // Garante diretório de saída (Java IO)
        Path dir = Path.of(Config.get("relatorio.dir"));
        Files.createDirectories(dir);

        // Polimorfismo: mesma interface, duas implementações
        List<Relatorio> relatorios = List.of(new RelatorioPDFService(), new RelatorioCSVService());

        // ExecutorService (pool de threads) — Tópico 12 refinado
        ExecutorService pool = Executors.newFixedThreadPool(Config.getInt("thread.pool.size"));
        for (Relatorio r : relatorios) {
            String saida = dir.resolve("relatorio_alunos." + r.getFormato().toLowerCase()).toString();
            pool.submit(new ProcessadorRelatorios(r, doBanco, saida));
        }
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);

        LOG.info("Concluído. Relatórios em " + dir.toAbsolutePath());
    }
}
