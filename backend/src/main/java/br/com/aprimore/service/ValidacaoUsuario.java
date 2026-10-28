package br.com.aprimore.service;

import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

public final class ValidacaoUsuario {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private ValidacaoUsuario() {
    }

    public static boolean nomeValido(String nome) {
        return nome != null && nome.trim().length() >= 2 && nome.trim().length() <= 100;
    }

    public static boolean emailValido(String email) {
        return email != null && email.length() <= 254 && EMAIL.matcher(email).matches();
    }

    public static boolean senhaValida(String senha) {
        if (senha == null || senha.length() < 10) {
            return false;
        }
        return senha.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}