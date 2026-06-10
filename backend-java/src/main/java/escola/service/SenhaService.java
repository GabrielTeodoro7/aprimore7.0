package escola.service;

import escola.exceptions.SenhaFracaException;
import escola.exceptions.SenhaReutilizadaException;
import escola.dao.SenhaHistoricoDAO;
import escola.model.PoliticaSenha;
import escola.model.Senha;
import escola.util.HashSenhaPBKDF2;

import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

// =============================================================================
// SenhaService — Núcleo de validação e troca de senha (RN.01, RN.62).
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   1) Valida se uma senha em claro atende à PoliticaSenha (tamanho,
//      maiúscula, minúscula, número, símbolo).
//   2) Verifica se a nova senha bate com alguma das últimas N (proibido).
//   3) Calcula o hash PBKDF2 e persiste no histórico.
//
// POR QUE FOI UTILIZADO:
//   Concentra a regra de "senha forte" e "não reutilizar" em um único
//   ponto, evitando duplicação entre cadastro, reset e admin.
//
// QUANDO UTILIZAR:
//   Sempre antes de aceitar uma senha vinda do usuário (cadastro, reset,
//   troca por expiração).
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Classes e Objetos (instâncias com estado).
//   - Encapsulamento (campos private final + métodos públicos).
//   - Exceções customizadas (SenhaFracaException, SenhaReutilizadaException).
//   - Coleções (List<String> motivos, List<Senha> historico).
//   - Polimorfismo via interface implícita ao chamar HashSenhaPBKDF2.
// =============================================================================
public class SenhaService {

    private final PoliticaSenha politica;
    private final SenhaHistoricoDAO dao;

    public SenhaService(PoliticaSenha politica, SenhaHistoricoDAO dao) {
        this.politica = politica;
        this.dao = dao;
    }

    // -------------------------------------------------------------------------
    // validarComplexidade — verificações sintáticas (RN.01).
    // Lança SenhaFracaException listando TODOS os problemas detectados.
    // CONTEÚDO ACADÊMICO: tratamento de erros agregados; Coleções (ArrayList).
    // -------------------------------------------------------------------------
    public void validarComplexidade(String senhaClara) throws SenhaFracaException {
        List<String> motivos = new ArrayList<>();
        if (senhaClara == null || senhaClara.length() < politica.getMinTamanho()) {
            motivos.add("mínimo de " + politica.getMinTamanho() + " caracteres");
        }
        if (politica.isExigeMaiuscula() && !senhaClara.matches(".*[A-Z].*"))
            motivos.add("letra maiúscula");
        if (politica.isExigeMinuscula() && !senhaClara.matches(".*[a-z].*"))
            motivos.add("letra minúscula");
        if (politica.isExigeNumero() && !senhaClara.matches(".*\\d.*"))
            motivos.add("número");
        if (politica.isExigeSimbolo() && !senhaClara.matches(".*[^A-Za-z0-9].*"))
            motivos.add("símbolo (ex.: !@#$)");
        if (!motivos.isEmpty()) throw new SenhaFracaException(motivos);
    }

    // -------------------------------------------------------------------------
    // verificarHistorico — recusa se a senha bater com alguma das últimas N.
    // CONTEÚDO ACADÊMICO: iteração de Coleção + uso de método estático
    // utilitário (HashSenhaPBKDF2.verificar).
    // -------------------------------------------------------------------------
    public void verificarHistorico(UUID userId, String senhaClara)
            throws SQLException, SenhaReutilizadaException {
        List<Senha> ultimas = dao.ultimas(userId, politica.getHistoricoN());
        for (Senha s : ultimas) {
            if (HashSenhaPBKDF2.verificar(senhaClara, s.getHash())) {
                throw new SenhaReutilizadaException(politica.getHistoricoN());
            }
        }
    }

    // -------------------------------------------------------------------------
    // registrarTroca — pipeline completo: valida → checa histórico → grava.
    // Devolve o hash PBKDF2 final para uso pelo chamador.
    // -------------------------------------------------------------------------
    public String registrarTroca(UUID userId, String senhaClara)
            throws SenhaFracaException, SenhaReutilizadaException, SQLException {
        validarComplexidade(senhaClara);
        verificarHistorico(userId, senhaClara);
        String hash = HashSenhaPBKDF2.hash(senhaClara);
        dao.inserir(new Senha(UUID.randomUUID(), userId, hash,
                              "PBKDF2WithHmacSHA256", 200_000, Instant.now()));
        return hash;
    }
}
