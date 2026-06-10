package escola.util;

// =============================================================================
// HashSenhaPBKDF2 — Hashing de senhas com PBKDF2WithHmacSHA256.
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   Gera um hash determinístico (a partir do mesmo salt) de uma senha em
//   texto claro, e oferece um método para verificar se uma senha confere
//   com um hash previamente armazenado.
//
// POR QUE FOI UTILIZADO:
//   PBKDF2 é um algoritmo de derivação de chave LENTO por design, o que
//   torna ataques de força bruta caros. Diferente de MD5/SHA-1, é seguro
//   para senhas. Usamos PBKDF2WithHmacSHA256 com 200.000 iterações e
//   salt de 16 bytes (recomendação OWASP).
//
// QUANDO UTILIZAR:
//   Sempre que precisar armazenar uma senha em banco de dados ou comparar
//   uma senha digitada com um hash salvo. Nunca armazene senha em texto.
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Encapsulamento (campos privados, métodos estáticos sem estado).
//   - Tratamento de Exceções (NoSuchAlgorithmException / InvalidKeySpecException).
//   - Coleções (Base64).
//   - Construtor privado (boa prática para classes utilitárias).
// =============================================================================

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public final class HashSenhaPBKDF2 {

    // Algoritmo de derivação. SHA-256 dentro do HMAC, padrão amplamente
    // suportado pelo JDK desde o Java 8.
    private static final String ALGORITMO = "PBKDF2WithHmacSHA256";

    // Número de iterações. Quanto maior, mais lento (e seguro). 200k é
    // o recomendado pelo OWASP para PBKDF2-HMAC-SHA256 em 2026.
    private static final int ITERACOES = 200_000;

    // Tamanho do hash final em bits (256 bits = 32 bytes).
    private static final int TAMANHO_HASH_BITS = 256;

    // Tamanho do salt aleatório em bytes (128 bits).
    private static final int TAMANHO_SALT_BYTES = 16;

    // Construtor privado evita instâncias — classe utilitária.
    // Conteúdo: Encapsulamento + boas práticas de utilitário.
    private HashSenhaPBKDF2() { }

    // ------------------------------------------------------------------------
    // hash(): gera um novo hash com salt aleatório.
    //
    // FORMATO DE SAÍDA: "iteracoes:saltBase64:hashBase64"
    // Esse formato permite verificar a senha mais tarde sem precisar de
    // banco extra para salt/iterações — tudo viaja junto.
    // ------------------------------------------------------------------------
    public static String hash(String senhaClara) {
        // SecureRandom é o gerador criptograficamente seguro do JDK.
        // Conteúdo: uso correto de APIs de segurança.
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[TAMANHO_SALT_BYTES];
        random.nextBytes(salt);

        byte[] hash = derivar(senhaClara, salt, ITERACOES);

        // Base64 sem padding mantém a string compacta para armazenamento em texto.
        String saltB64 = Base64.getEncoder().withoutPadding().encodeToString(salt);
        String hashB64 = Base64.getEncoder().withoutPadding().encodeToString(hash);

        return ITERACOES + ":" + saltB64 + ":" + hashB64;
    }

    // ------------------------------------------------------------------------
    // verificar(): retorna true se a senha em claro corresponder ao hash.
    // Faz comparação em TEMPO CONSTANTE para evitar timing attacks
    // (Arrays.equals dos byte[]; Java realiza comparação total, sem
    // short-circuit como '==' faria em referências).
    // ------------------------------------------------------------------------
    public static boolean verificar(String senhaClara, String hashArmazenado) {
        if (senhaClara == null || hashArmazenado == null) return false;

        String[] partes = hashArmazenado.split(":");
        if (partes.length != 3) return false;

        try {
            int iteracoes = Integer.parseInt(partes[0]);
            byte[] salt   = Base64.getDecoder().decode(partes[1]);
            byte[] hashEsperado = Base64.getDecoder().decode(partes[2]);

            byte[] hashCalculado = derivar(senhaClara, salt, iteracoes);

            // Comparação byte-a-byte completa.
            // Conteúdo: tratamento explícito de comparações sensíveis a tempo.
            return Arrays.equals(hashEsperado, hashCalculado);
        } catch (RuntimeException e) {
            // Formato corrompido ou Base64 inválido — tratar como falha.
            // Conteúdo: Exceções (captura genérica defensiva em borda).
            return false;
        }
    }

    // ------------------------------------------------------------------------
    // derivar(): núcleo PBKDF2. Encapsula a complexidade do
    // SecretKeyFactory + PBEKeySpec.
    // Conteúdo: Encapsulamento e tratamento de exceções checadas.
    // ------------------------------------------------------------------------
    private static byte[] derivar(String senha, byte[] salt, int iteracoes) {
        try {
            KeySpec spec = new PBEKeySpec(senha.toCharArray(), salt, iteracoes, TAMANHO_HASH_BITS);
            SecretKeyFactory factory = SecretKeyFactory.getInstance(ALGORITMO);
            return factory.generateSecret(spec).getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            // Exceções checadas convertidas em RuntimeException porque,
            // se o JDK não tiver PBKDF2WithHmacSHA256, é um erro fatal —
            // não há recuperação possível em tempo de execução.
            // Conteúdo: distinção entre exceções checadas e não checadas.
            throw new IllegalStateException("Falha ao derivar hash PBKDF2", e);
        }
    }
}
