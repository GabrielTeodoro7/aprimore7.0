package br.com.aprimore.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LimiteTentativasFilterTest {
    @Test
    void permiteAteOLimiteERejeitaTentativaSeguinte() {
        String chave = "teste-login-" + System.nanoTime();
        long agora = 1_000_000L;

        assertTrue(LimiteTentativasFilter.permitir(chave, 3, agora, 60_000));
        assertTrue(LimiteTentativasFilter.permitir(chave, 3, agora + 1, 60_000));
        assertTrue(LimiteTentativasFilter.permitir(chave, 3, agora + 2, 60_000));
        assertFalse(LimiteTentativasFilter.permitir(chave, 3, agora + 3, 60_000));
    }

    @Test
    void liberaNovasTentativasDepoisDaJanela() {
        String chave = "teste-expiracao-" + System.nanoTime();
        long agora = 2_000_000L;

        assertTrue(LimiteTentativasFilter.permitir(chave, 1, agora, 1_000));
        assertFalse(LimiteTentativasFilter.permitir(chave, 1, agora + 500, 1_000));
        assertTrue(LimiteTentativasFilter.permitir(chave, 1, agora + 1_000, 1_000));
    }

    @Test
    void rejeitaConfiguracaoDeLimiteInvalida() {
        assertThrows(IllegalArgumentException.class,
            () -> LimiteTentativasFilter.permitir("teste-invalido", 0, 1_000, 1_000));
    }
}
