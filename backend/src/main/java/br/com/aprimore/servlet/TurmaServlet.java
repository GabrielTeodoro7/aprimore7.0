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

@WebServlet("/api/turmas")
public class TurmaServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        String perfil = ApiUtil.perfil(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!ApiUtil.perfilPermitido(perfil, "PROFESSOR", "ADMIN", "CEO")) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Você não tem permissão para consultar turmas.\"}");
            return;
        }

        String sql = "SELECT t.id, t.nome, t.ano_letivo, t.professor_id, u.nome AS professor_nome "
            + "FROM turmas t JOIN usuarios u ON u.id = t.professor_id "
            + (perfil.equals("PROFESSOR") ? "WHERE t.professor_id = ? " : "")
            + "ORDER BY t.ano_letivo DESC, t.nome";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            if (perfil.equals("PROFESSOR")) statement.setLong(1, usuarioId);
            try (ResultSet rows = statement.executeQuery()) {
                StringBuilder json = new StringBuilder("[");
                while (rows.next()) {
                    if (json.length() > 1) json.append(',');
                    json.append("{\"id\":").append(rows.getLong("id"))
                        .append(",\"nome\":\"").append(ApiUtil.escapar(rows.getString("nome")))
                        .append("\",\"anoLetivo\":").append(rows.getInt("ano_letivo"))
                        .append(",\"professorId\":").append(rows.getLong("professor_id"))
                        .append(",\"professorNome\":\"").append(ApiUtil.escapar(rows.getString("professor_nome")))
                        .append("\"}");
                }
                ApiUtil.responder(response, 200, json.append(']').toString());
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar turmas.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar as turmas.\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        Long usuarioId = ApiUtil.usuarioId(request);
        String perfil = ApiUtil.perfil(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!ApiUtil.perfilPermitido(perfil, "PROFESSOR", "ADMIN", "CEO")) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Você não tem permissão para criar turmas.\"}");
            return;
        }

        String nome = valor(request, "nome");
        String anoTexto = valor(request, "anoLetivo");
        String professorTexto = valor(request, "professorId");
        int ano;
        long professorId = usuarioId;
        try {
            ano = Integer.parseInt(anoTexto);
            if (!perfil.equals("PROFESSOR")) {
                professorId = Long.parseLong(professorTexto);
            }
        } catch (NumberFormatException exception) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Ano letivo ou professor inválido.\"}");
            return;
        }
        if (nome.length() < 2 || nome.length() > 120 || ano < 2000 || ano > 2100) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Informe nome e ano letivo válidos.\"}");
            return;
        }

        String sql = "INSERT INTO turmas (professor_id, nome, ano_letivo) VALUES (?, ?, ?)";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS)) {
            if (!perfil.equals("PROFESSOR") && !professorAtivo(connection, professorId)) {
                ApiUtil.responder(response, 400, "{\"erro\":\"O professor informado não existe ou está inativo.\"}");
                return;
            }
            statement.setLong(1, professorId);
            statement.setString(2, nome);
            statement.setInt(3, ano);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (!keys.next()) throw new SQLException("Identificador da turma não retornado.");
                ApiUtil.responder(response, 201, "{\"id\":" + keys.getLong(1) + ",\"nome\":\""
                    + ApiUtil.escapar(nome) + "\",\"anoLetivo\":" + ano + ",\"professorId\":" + professorId + "}");
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao criar turma.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível criar a turma. Verifique os dados e tente novamente.\"}");
        }
    }

    private boolean professorAtivo(Connection connection, long id) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT 1 FROM usuarios WHERE id = ? AND perfil = 'PROFESSOR' AND status = 'ATIVO'")) {
            statement.setLong(1, id);
            try (ResultSet result = statement.executeQuery()) {
                return result.next();
            }
        }
    }

    private String valor(HttpServletRequest request, String nome) {
        String valor = request.getParameter(nome);
        return valor == null ? "" : valor.trim();
    }
}