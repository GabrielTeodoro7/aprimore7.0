package br.com.aprimore.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import br.com.aprimore.util.ApiUtil;

@WebFilter(urlPatterns = "/api/*")
public class CsrfFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String uri = httpRequest.getRequestURI();
        String contextPath = httpRequest.getContextPath();
        String path = uri.substring(contextPath.length());

        if (!"POST".equalsIgnoreCase(httpRequest.getMethod()) || path.startsWith("/api/auth/")) {
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = httpRequest.getSession(false);
        Object tokenInSession = session == null ? null : session.getAttribute("csrfToken");
        String tokenInRequest = httpRequest.getHeader("X-CSRF-Token");
        if (!(tokenInSession instanceof String expected) || tokenInRequest == null
                || !MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                    tokenInRequest.getBytes(StandardCharsets.UTF_8))) {
            ApiUtil.responder(httpResponse, 403, "{\"erro\":\"A validação de segurança da solicitação falhou. Atualize a página e tente novamente.\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}