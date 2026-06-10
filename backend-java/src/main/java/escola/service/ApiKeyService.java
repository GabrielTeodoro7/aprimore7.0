package escola.service;

import escola.dao.ApiKeyDAO;
import escola.exceptions.ApiKeyInvalidaException;
import escola.model.ApiKey;

import java.sql.SQLException;
import java.time.Instant;

public class ApiKeyService {
    private final ApiKeyDAO dao;

    public ApiKeyService() throws SQLException {
        this.dao = new ApiKeyDAO();
    }

    public void validar(String hash) throws ApiKeyInvalidaException, SQLException {
        ApiKey key = dao.buscarPorHash(hash)
                .orElseThrow(() -> new ApiKeyInvalidaException("API Key não encontrada."));
        
        if (key.getExpiraEm() != null && key.getExpiraEm().isBefore(Instant.now())) {
            throw new ApiKeyInvalidaException("API Key expirada.");
        }
    }
}
