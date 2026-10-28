package br.com.aprimore.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiUtilTest {
    @Test
    void escapaCaracteresQueQuebrariamJson() {
        assertEquals("linha\\n\\\"dois\\\"\\\\fim", ApiUtil.escapar("linha\n\"dois\"\\fim"));
        assertEquals("\\\\u0001", ApiUtil.escapar(Character.toString((char) 1)));
    }

    @Test
    void verificaPermissoesPorPerfil() {
        assertTrue(ApiUtil.perfilPermitido("PROFESSOR", "ALUNO", "PROFESSOR"));
        assertFalse(ApiUtil.perfilPermitido("ALUNO", "ADMIN", "CEO"));
    }

    @Test
    void valorNuloNaoGeraErroNaSerializacao() {
        assertEquals("", ApiUtil.escapar(null));
    }
}