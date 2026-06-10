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

/**
 * =================================================================================================
 * PROJETO APRIMORE EDUCATION - BACKEND JAVA (DEMONSTRAÇÃO ACADÊMICA)
 * =================================================================================================
 * Este é o ponto de entrada principal que integra todos os conceitos de Programação Orientada 
 * a Objetos e recursos avançados do Java requisitados.
 * 
 * ORDEM DE APRESENTAÇÃO DOS CONCEITOS:
 * 1. Classes e Objetos (Aluno, Professor, Turma)
 * 2. Herança e Polimorfismo (Pessoa -> Aluno/Professor)
 * 3. Encapsulamento (Getters/Setters e modificadores de acesso)
 * 4. Interfaces (Relatorio)
 * 5. Coleções (List, ArrayList)
 * 6. Tratamento de Exceções (SQLException, IOException)
 * 7. Java IO (Files, Path)
 * 8. Threads (ExecutorService para relatórios paralelos)
 * 9. JDBC (AlunoDAO acessando SQLite)
 * =================================================================================================
 */
public class Main {
    private static final Logger LOG = Log.get(Main.class);

    public static void main(String[] args) throws Exception {

        LOG.info("=== INICIANDO SISTEMA APRIMORE EDUCATION (BACKEND JAVA) ===");

        // -----------------------------------------------------------------------------------------
        // TÓPICO 1, 2 e 4: CLASSES, OBJETOS, CONSTRUTORES E HERANÇA
        // -----------------------------------------------------------------------------------------
        Aluno a1 = new Aluno("Gabriel Teodoro", "123.456.789-00", "2026001", 9.5);
        Aluno a2 = new Aluno("Ana Beatriz",     "987.654.321-11", "2026002", 8.8);
        Professor p1 = new Professor("Dr. Marcos Silva", "111.222.333-44", "Inteligência Artificial");

        // -----------------------------------------------------------------------------------------
        // TÓPICO 8: POLIMORFISMO
        // Aluno e Professor são tratados como 'Pessoa'. O Java decide qual 'apresentar()' chamar em runtime.
        // -----------------------------------------------------------------------------------------
        List<Pessoa> pessoas = new ArrayList<>(List.of(a1, a2, p1));
        LOG.info("Demonstrando Polimorfismo (Lista de Pessoas):");
        pessoas.forEach(p -> LOG.info("  > " + p.apresentar()));

        // -----------------------------------------------------------------------------------------
        // TÓPICO 9: COLEÇÕES DO JAVA
        // Gerenciando turmas e matrículas dinamicamente.
        // -----------------------------------------------------------------------------------------
        Turma t = new Turma("Turma Especial IA - 2026");
        t.matricular(a1); 
        t.matricular(a2);
        LOG.info("Média atual da " + t.getNome() + ": " + t.mediaTurma());

        // -----------------------------------------------------------------------------------------
        // TÓPICO 14: JDBC (Banco de Dados)
        // O AlunoDAO utiliza JDBC para persistir os dados no SQLite (escola.db).
        // -----------------------------------------------------------------------------------------
        AlunoDAO dao = new AlunoDAO();
        MatriculaService matriculaService = new MatriculaService(dao);
        
        try { 
            LOG.info("Persistindo alunos no banco de dados via JDBC...");
            matriculaService.matricular(a1); 
            matriculaService.matricular(a2); 
        } catch (Exception e) { 
            // TÓPICO 11: TRATAMENTO DE EXCEÇÕES
            LOG.warning("Erro ao acessar banco de dados (JDBC): " + e.getMessage()); 
        }
        
        List<Aluno> alunosDoBanco = matriculaService.todos();

        // -----------------------------------------------------------------------------------------
        // TÓPICO 9: JAVA IO
        // Criando diretórios e manipulando arquivos no sistema de arquivos.
        // -----------------------------------------------------------------------------------------
        Path dirRelatorios = Path.of(Config.get("relatorio.dir"));
        Files.createDirectories(dirRelatorios);

        // -----------------------------------------------------------------------------------------
        // TÓPICO 5 e 12: INTERFACES E THREADS
        // Disparamos a geração de relatórios (PDF e CSV) em paralelo usando Threads.
        // -----------------------------------------------------------------------------------------
        List<Relatorio> geradores = List.of(new RelatorioPDFService(), new RelatorioCSVService());
        
        LOG.info("Iniciando geração de relatórios paralelos (Threads)...");
        ExecutorService pool = Executors.newFixedThreadPool(Config.getInt("thread.pool.size"));
        
        for (Relatorio gerador : geradores) {
            String caminhoArquivo = dirRelatorios.resolve("alunos_consolidado." + gerador.getFormato().toLowerCase()).toString();
            // Cada ProcessadorRelatorios implementa Runnable (Thread)
            pool.submit(new ProcessadorRelatorios(gerador, alunosDoBanco, caminhoArquivo));
        }
        
        pool.shutdown();
        if (pool.awaitTermination(15, TimeUnit.SECONDS)) {
            LOG.info("Todos os processos de Threads finalizados com sucesso.");
        }

        LOG.info("=== SISTEMA FINALIZADO. VERIFIQUE OS ARQUIVOS EM: " + dirRelatorios.toAbsolutePath() + " ===");
    }
}
