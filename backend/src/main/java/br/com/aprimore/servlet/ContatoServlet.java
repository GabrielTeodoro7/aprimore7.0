package br.com.aprimore.servlet;

import br.com.aprimore.config.Database;
import br.com.aprimore.util.ApiUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/api/contatos")
public class ContatoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        String perfil = ApiUtil.perfil(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        String sql = "SELECT id, nome, perfil FROM usuarios WHERE status = 'ATIVO' AND id <> ? "
            + (perfil.equals("ALUNO") ? "AND perfil IN ('PROFESSOR', 'ADMIN', 'CEO') " : "")
            + "ORDER BY perfil, nome";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, usuarioId);
            try (ResultSet rows = statement.executeQuery()) {
                StringBuilder json = new StringBuilder("[");
                while (rows.next()) {
                    if (json.length() > 1) json.append(',');
                    json.append("{\"id\":").append(rows.getLong("id"))
                        .append(",\"nome\":\"").append(ApiUtil.escapar(rows.getString("nome")))
                        .append("\",\"perfil\":\"").append(ApiUtil.escapar(rows.getString("perfil"))).append("\"}");
                }
                ApiUtil.responder(response, 200, json.append(']').toString());
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar contatos permitidos.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar os contatos.\"}");
        }
    }
}