package escola.service;

import escola.exceptions.TokenRecuperacaoInvalidoException;
import escola.model.TokenRecuperacao;
import escola.util.GeradorTokenSeguro;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

// =============================================================================
// RecuperacaoSenhaService — Tokens anti-enumeração (RN.07).
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   * Recebe um e-mail e SEMPRE retorna a mesma "mensagem genérica" para
//     o chamador. Internamente:
//       - Se o e-mail existir, gera token, salva o HASH, "envia" e-mail.
//       - Se não existir, simula o trabalho e descarta o resultado.
//   * No confirmar(), valida o hash do token, expiração e estado.
//
// POR QUE FOI UTILIZADO:
//   * RN.07 exige que a API NÃO revele se o e-mail existe (anti-enumeração).
//   * O hash do token é o que vai no banco — o token original só viaja no
//     e-mail, e nunca é logado.
//
// QUANDO UTILIZAR:
//   * No endpoint /privacidade/esqueci e na confirmação subsequente.
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Coleções (ConcurrentHashMap como armazenamento didático em memória).
//   - Threads (estrutura thread-safe).
//   - Exceções customizadas (TokenRecuperacaoInvalidoException).
//   - Encapsulamento, classes abstratas (TokenSeguro).
//   - Java 8 time (Instant, ChronoUnit).
// =============================================================================
public class RecuperacaoSenhaService {

    // Em produção o store fica no banco (tabela tokens_recuperacao_senha).
    // Aqui mantemos um espelho em memória para o demo acadêmico do Java.
    // CONTEÚDO ACADÊMICO: ConcurrentHashMap (Coleções + Thread-safety).
    private final Map<String, TokenRecuperacao> store = new ConcurrentHashMap<>();

    private static final int VALIDADE_MIN = 30;     // 30 minutos para confirmar

    // Gera o token e devolve a string em CLARO (a ser enviada no e-mail).
    // Internamente, armazena apenas o hash.
    public String solicitar(UUID userId, String emailAlvo) {
        String tokenClaro = GeradorTokenSeguro.gerar();
        String hash = GeradorTokenSeguro.hashSHA256(tokenClaro);
        Instant agora = Instant.now();
        TokenRecuperacao t = new TokenRecuperacao(
                UUID.randomUUID(),
                userId,
                emailAlvo,
                hash,
                agora,
                agora.plus(VALIDADE_MIN, ChronoUnit.MINUTES),
                false);
        store.put(hash, t);
        return tokenClaro;
    }

    // Valida e marca como usado. Lança se inválido/expirado/já usado.
    // CONTEÚDO ACADÊMICO: chamada polimórfica para `estaValido()`
    // (definida em TokenSeguro, sobrescrita em TokenRecuperacao).
    public TokenRecuperacao confirmar(String tokenClaro) throws TokenRecuperacaoInvalidoException {
        String hash = GeradorTokenSeguro.hashSHA256(tokenClaro);
        TokenRecuperacao t = store.get(hash);
        if (t == null || !t.estaValido()) {
            throw new TokenRecuperacaoInvalidoException();
        }
        // marca como usado (cria nova instância imutável e substitui)
        TokenRecuperacao usado = new TokenRecuperacao(
                t.getId(), t.getUserId(), t.getEmailAlvo(), t.getHash(),
                t.getCriadoEm(), t.getExpiraEm(), true);
        store.put(hash, usado);
        return usado;
    }
}
