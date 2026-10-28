package br.com.aprimore.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ValidacaoUsuarioTest {
    @Test
    void aceitaDadosValidos() {
        assertTrue(ValidacaoUsuario.nomeValido("Ana Souza"));
        assertTrue(ValidacaoUsuario.emailValido("ana@example.com"));
        assertTrue(ValidacaoUsuario.senhaValida("senha-segura"));
    }

    @Test
    void rejeitaDadosInvalidos() {
        assertFalse(ValidacaoUsuario.nomeValido("A"));
        assertFalse(ValidacaoUsuario.emailValido("email-invalido"));
        assertFalse(ValidacaoUsuario.senhaValida("curta"));
        assertFalse(ValidacaoUsuario.senhaValida("á".repeat(37)));
    }

    @Test
    void respeitaLimiteBCryptEmBytesUtf8() {
        assertTrue(ValidacaoUsuario.senhaValida("a".repeat(72)));
        assertFalse(ValidacaoUsuario.senhaValida("a".repeat(73)));
        assertFalse(ValidacaoUsuario.senhaValida("é".repeat(37)));
    }
}