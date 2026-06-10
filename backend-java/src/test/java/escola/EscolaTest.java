package escola;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.SQLException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import escola.dao.AlunoDAO;
import escola.exceptions.MatriculaInvalidaException;
import escola.model.Aluno;
import escola.service.RelatorioCSVService;

class EscolaTest {

    private AlunoDAO alunoDAO;

    @BeforeEach
    void setUp(@org.junit.jupiter.api.io.TempDir Path tmp) throws SQLException {
        // Cria um DAO com banco em arquivo temporário isolado por teste
        // A tabela já é criada no construtor do AlunoDAO
        Path databaseFile = tmp.resolve("escola.db");
        alunoDAO = new AlunoDAO("jdbc:sqlite:" + databaseFile.toAbsolutePath());
    }

    @Test
    void matriculaInvalidaLancaExcecao() throws Exception {
        Aluno ruim = new Aluno("X", "1", "12", 5.0); // matrícula curta
        assertThrows(MatriculaInvalidaException.class, () -> alunoDAO.inserir(ruim));
    }

    @Test
    void crudAlunoEmMemoria() throws Exception {
        alunoDAO.inserir(new Aluno("Ana", "123", "2024001", 9.0));
        List<Aluno> todos = alunoDAO.listar();
        assertEquals(1, todos.size());
        assertEquals("Ana", todos.get(0).getNome());
    }

    @Test
    void relatorioCSVGeraArquivo(@org.junit.jupiter.api.io.TempDir Path tmp) throws Exception {
        Path saida = tmp.resolve("relatorio.csv");
        new RelatorioCSVService().gerar(
            List.of(new Aluno("Ana", "123", "2024001", 9.0)), 
            saida.toString()
        );
        assertTrue(Files.exists(saida));
        assertTrue(Files.readString(saida).contains("Ana"));
    }
}