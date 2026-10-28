package br.com.aprimore.security;

import br.com.aprimore.config.Database;
import br.com.aprimore.util.ApiUtil;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@WebFilter(urlPatterns = "/api/*")
public class RegistroAuditoriaFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        chain.doFilter(request, response);

        String method = httpRequest.getMethod().toUpperCase();
        if (!method.equals("POST") && !method.equals("PUT")
                && !method.equals("PATCH") && !method.equals("DELETE")) return;
        if (httpResponse.getStatus() < 200 || httpResponse.getStatus() >= 300) return;

        String path = httpRequest.getRequestURI().substring(httpRequest.getContextPath().length());
        if (path.startsWith("/api/auth/") || path.equals("/api/auditoria")) return;

        Long usuarioId = ApiUtil.usuarioId(httpRequest);
        if (usuarioId == null) return;

        String[] partes = path.split("/");
        String entidade = partes.length > 2 ? partes[2] : "sistema";
        String acao = method + " " + path;
        String detalhes = "{\"metodo\":\"" + ApiUtil.escapar(method)
                + "\",\"rota\":\"" + ApiUtil.escapar(path) + "\"}";
        String ip = httpRequest.getRemoteAddr();

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                     "INSERT INTO audit_logs (usuario_id, acao, entidade, detalhes, ip_origem) VALUES (?, ?, ?, ?, ?)")) {
            statement.setLong(1, usuarioId);
            statement.setString(2, acao);
            statement.setString(3, entidade);
            statement.setString(4, detalhes);
            statement.setString(5, ip);
            statement.executeUpdate();
        } catch (SQLException | IllegalStateException exception) {
            httpRequest.getServletContext().log("Não foi possível registrar a operação no histórico de auditoria.", exception);
        }
    }
}