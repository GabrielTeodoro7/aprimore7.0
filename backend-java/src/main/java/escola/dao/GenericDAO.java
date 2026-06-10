package escola.dao;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

// Contrato genérico de DAO — reforça INTERFACES e GENERICS.
public interface GenericDAO<T, ID> {
    void inserir(T entidade) throws Exception;
    void atualizar(T entidade) throws SQLException;
    void remover(ID id) throws SQLException;
    Optional<T> buscarPorId(ID id) throws SQLException;
    List<T> listar() throws SQLException;
}
