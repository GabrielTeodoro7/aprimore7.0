package escola.util;

// =============================================================================
// GeradorTokenSeguro — Tokens aleatórios para recuperação de senha / refresh.
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   Gera tokens criptograficamente seguros (256 bits) codificados em
//   Base64URL sem padding, prontos para serem usados em URLs ou cabeçalhos.
//
// POR QUE FOI UTILIZADO:
//   Tokens de recuperação (RN.07) e refresh (RN.03) PRECISAM ser
//   imprevisíveis e únicos. `Math.random()` NÃO É seguro para isso;
//   `SecureRandom` é a API correta do JDK.
//
// QUANDO UTILIZAR:
//   Sempre que for criar um identificador opaco que serve de credencial
//   (token de e-mail de recuperação, refresh token, chave de API, etc.).
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Classe utilitária com construtor privado (Encapsulamento).
//   - Uso de bibliotecas padrão (java.security.SecureRandom).
//   - Codificação (Base64).
// =============================================================================

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public final class GeradorTokenSeguro {

    // 32 bytes = 256 bits → segurança alta, mesma ordem de grandeza de uma chave AES-256.
    private static final int TAMANHO_BYTES_PADRAO = 32;

    private GeradorTokenSeguro() { }

    // Gera um token aleatório novo.
    // Conteúdo: uso de SecureRandom (boa prática).
    public static String gerar() {
        return gerar(TAMANHO_BYTES_PADRAO);
    }

    public static String gerar(int tamanhoBytes) {
        byte[] buffer = new byte[tamanhoBytes];
        new SecureRandom().nextBytes(buffer);
        // Base64URL para ser seguro em URLs (sem '+' nem '/').
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer);
    }

    // Hash SHA-256 do token, para armazenar no banco SEM revelar o token original.
    // Estratégia: cliente recebe o token cru; o servidor guarda só o hash.
    // Conteúdo: Encapsulamento + Exceções (NoSuchAlgorithmException tratada).
    public static String hashSHA256(String tokenClaro) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(tokenClaro.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 sempre existe no JDK; se não existir, é erro fatal.
            throw new IllegalStateException("SHA-256 indisponível no JDK", e);
        }
    }
}
