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
    void rejeitaNomeEmailESenhaInvalidos() {
        assertFalse(ValidacaoUsuario.nomeValido("A"));
        assertFalse(ValidacaoUsuario.emailValido("email-invalido"));
        assertFalse(ValidacaoUsuario.senhaValida("curta"));
        assertFalse(ValidacaoUsuario.senhaValida("á".repeat(37)));
    }
}