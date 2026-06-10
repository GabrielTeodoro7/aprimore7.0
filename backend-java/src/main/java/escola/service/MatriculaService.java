package escola.service;

import escola.dao.AlunoDAO;
import escola.exceptions.MatriculaInvalidaException;
import escola.model.Aluno;
import escola.util.Log;

import java.sql.SQLException;
import java.util.List;
import java.util.logging.Logger;

// Camada de serviço: regras de negócio entre Main e DAO.
public class MatriculaService {
    private static final Logger LOG = Log.get(MatriculaService.class);
    private final AlunoDAO dao;

    public MatriculaService(AlunoDAO dao) { this.dao = dao; }

    public void matricular(Aluno a) throws SQLException, MatriculaInvalidaException {
        LOG.info("Matriculando " + a.getNome());
        dao.inserir(a);
    }

    public List<Aluno> todos() throws SQLException { return dao.listar(); }
}
