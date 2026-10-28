package br.com.aprimore.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

public final class ApiUtil {
    private ApiUtil() {
    }

    public static Long usuarioId(HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);
        Object id = sessao == null ? null : sessao.getAttribute("usuarioId");
        return id instanceof Long valor ? valor : null;
    }

    public static String perfil(HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);
        Object perfil = sessao == null ? null : sessao.getAttribute("usuarioPerfil");
        return perfil instanceof String valor ? valor : "";
    }

    public static boolean perfilPermitido(String perfil, String... permitidos) {
        for (String permitido : permitidos) {
            if (permitido.equals(perfil)) return true;
        }
        return false;
    }

    public static void responder(HttpServletResponse response, int status, String json) throws IOException {
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setHeader("Cache-Control", "no-store");
        response.setStatus(status);
        response.getWriter().write(json);
    }

    public static String escapar(String valor) {
        if (valor == null) return "";
        StringBuilder resultado = new StringBuilder(valor.length());
        for (int i = 0; i < valor.length(); i++) {
            char caractere = valor.charAt(i);
            switch (caractere) {
                case '\\' -> resultado.append("\\\\");
                case '"' -> resultado.append("\\\"");
                case '\n' -> resultado.append("\\n");
                case '\r' -> resultado.append("\\r");
                case '\t' -> resultado.append("\\t");
                case '\b' -> resultado.append("\\b");
                case '\f' -> resultado.append("\\f");
                default -> {
                    if (caractere < 0x20) resultado.append(String.format("\\u%04x", (int) caractere));
                    else resultado.append(caractere);
                }
            }
        }
        return resultado.toString();
    }
}