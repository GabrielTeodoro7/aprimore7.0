package escola.service;

import escola.exceptions.ConflitoEdicaoException;
import escola.interfaces.Versionavel;

/**
 * O QUE: Serviço que gerencia o versionamento de registros acadêmicos.
 * POR QUE: Centraliza a lógica da RN.50 para evitar repetição.
 * CONTEÚDO ACADÊMICO: Generics, Polimorfismo, Tratamento de Exceções.
 */
public class VersionadorService {

    /**
     * Valida se a versão enviada pelo cliente coincide com a do banco.
     * @param objetoNoBanco O objeto atual carregado do DB.
     * @param versaoEnviada A versão que o usuário possuía ao abrir a tela.
     */
    public <T extends Versionavel> void validar(T objetoNoBanco, int versaoEnviada) throws ConflitoEdicaoException {
        if (objetoNoBanco.getVersao() != versaoEnviada) {
            // Lançamento de exceção (Exceções)
            throw new ConflitoEdicaoException(
                "O registro foi alterado por outro usuário (Versão atual: " + 
                objetoNoBanco.getVersao() + ", Sua versão: " + versaoEnviada + "). " +
                "Por favor, recarregue os dados antes de salvar."
            );
        }
    }
}
