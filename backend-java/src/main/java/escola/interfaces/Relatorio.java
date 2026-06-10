package escola.interfaces;

import java.io.IOException;
import java.util.List;
import escola.model.Aluno;

/**
 * =================================================================================================
 * TÓPICO 5 — INTERFACES
 * =================================================================================================
 * Uma Interface em Java define um "contrato" que outras classes devem seguir.
 * Ela não contém lógica, apenas as assinaturas dos métodos que devem ser implementados.
 * 
 * Qualquer classe que queira ser um "Relatorio" (como RelatorioPDFService) DEVE implementar
 * estes métodos. Isso permite tratar diferentes tipos de relatórios de forma polimórfica.
 * =================================================================================================
 */
public interface Relatorio {
    
    /**
     * TÓPICO 11 — EXCEÇÕES DO JAVA (Exceptions)
     * O método declara que pode lançar uma 'IOException', forçando quem chama a tratar o erro
     * (bloco try-catch), garantindo a robustez do sistema.
     * 
     * TÓPICO 9 — COLEÇÕES DO JAVA (Collections)
     * Recebe uma 'List<Aluno>', demonstrando o uso de listas dinâmicas do pacote java.util.
     */
    void gerar(List<Aluno> alunos, String caminhoSaida) throws IOException;
    
    String getFormato();
}
