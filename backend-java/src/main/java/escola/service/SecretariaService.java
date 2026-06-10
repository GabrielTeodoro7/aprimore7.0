package escola.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * RN.71-73: Serviços de Secretaria e Matrícula.
 * Conteúdo Acadêmico: Coleções e Exception Handling.
 */
public class SecretariaService {
    private List<String> documentosObrigatorios;

    public SecretariaService() {
        documentosObrigatorios = new ArrayList<>();
        documentosObrigatorios.add("RG");
        documentosObrigatorios.add("CPF");
        documentosObrigatorios.add("HISTORICO");
    }

    /**
     * Valida se todos os documentos foram entregues.
     */
    public boolean validarDocumentacao(List<String> documentosEntregues) {
        return documentosEntregues.containsAll(documentosObrigatorios);
    }
}
