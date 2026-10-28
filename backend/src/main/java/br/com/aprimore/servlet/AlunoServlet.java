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

@WebServlet("/api/alunos")
public class AlunoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        String perfil = ApiUtil.perfil(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!ApiUtil.perfilPermitido(perfil, "ALUNO", "PROFESSOR", "ADMIN", "CEO")) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Você não tem permissão para consultar alunos.\"}");
            return;
        }

        String filtro = switch (perfil) {
            case "PROFESSOR" -> "WHERE t.professor_id = ? ";
            case "ALUNO" -> "WHERE a.usuario_id = ? ";
            default -> "";
        };
        String campos = perfil.equals("ALUNO")
            ? "a.id, a.nome, a.turma_id, t.nome AS turma_nome, NULL AS responsavel, "
                + "NULL AS email_responsavel, NULL AS necessidade_educacional, a.ativo "
            : "a.id, a.nome, a.turma_id, t.nome AS turma_nome, a.responsavel, "
                + "a.email_responsavel, a.necessidade_educacional, a.ativo ";
        String sql = "SELECT " + campos
            + "FROM alunos a JOIN turmas t ON t.id = a.turma_id "
            + filtro + "ORDER BY a.nome";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            if (!filtro.isEmpty()) statement.setLong(1, usuarioId);
            try (ResultSet rows = statement.executeQuery()) {
                StringBuilder json = new StringBuilder("[");
                while (rows.next()) {
                    if (json.length() > 1) json.append(',');
                    json.append("{\"id\":").append(rows.getLong("id"))
                        .append(",\"nome\":\"").append(ApiUtil.escapar(rows.getString("nome")))
                        .append("\",\"turmaId\":").append(rows.getLong("turma_id"))
                        .append(",\"turmaNome\":\"").append(ApiUtil.escapar(rows.getString("turma_nome")))
                        .append("\",\"responsavel\":\"").append(ApiUtil.escapar(rows.getString("responsavel")))
                        .append("\",\"emailResponsavel\":\"").append(ApiUtil.escapar(rows.getString("email_responsavel")))
                        .append("\",\"necessidadeEducacional\":\"").append(ApiUtil.escapar(rows.getString("necessidade_educacional")))
                        .append("\",\"ativo\":").append(rows.getBoolean("ativo")).append('}');
                }
                ApiUtil.responder(response, 200, json.append(']').toString());
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar alunos.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar os alunos.\"}");
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
            ApiUtil.responder(response, 403, "{\"erro\":\"Você não tem permissão para cadastrar alunos.\"}");
            return;
        }

        long turmaId;
        try {
            turmaId = Long.parseLong(valor(request, "turmaId"));
        } catch (NumberFormatException exception) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Informe uma turma válida.\"}");
            return;
        }
        String nome = valor(request, "nome");
        String responsavel = valor(request, "responsavel");
        String emailResponsavel = valor(request, "emailResponsavel");
        String necessidade = valor(request, "necessidadeEducacional");
        String usuarioTexto = valor(request, "usuarioId");
        Long contaAlunoId = null;
        if (!usuarioTexto.isBlank()) {
            try {
                contaAlunoId = Long.parseLong(usuarioTexto);
            } catch (NumberFormatException exception) {
                ApiUtil.responder(response, 400, "{\"erro\":\"Informe um ID de conta válido.\"}");
                return;
            }
        }
        if (nome.length() < 2 || nome.length() > 120
                || responsavel.length() > 120 || emailResponsavel.length() > 254 || necessidade.length() > 500) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Confira o nome e os limites dos campos informados.\"}");
            return;
        }
        if (!emailResponsavel.isBlank() && !emailResponsavel.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            ApiUtil.responder(response, 400, "{\"erro\":\"O e-mail do responsável não é válido.\"}");
            return;
        }

        String sql = "INSERT INTO alunos (turma_id, usuario_id, nome, responsavel, email_responsavel, necessidade_educacional) "
            + "VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection connection = Database.getConnection()) {
            if (contaAlunoId != null && !contaAlunoAtiva(connection, contaAlunoId)) {
                ApiUtil.responder(response, 400, "{\"erro\":\"A conta informada não existe, está inativa ou não pertence a um aluno.\"}");
                return;
            }
            if (!turmaPermitida(connection, turmaId, usuarioId, perfil)) {
                ApiUtil.responder(response, 403, "{\"erro\":\"A turma não existe ou você não tem permissão para gerenciá-la.\"}");
                return;
            }
            try (PreparedStatement statement = connection.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS)) {
                statement.setLong(1, turmaId);
                if (contaAlunoId == null) statement.setNull(2, java.sql.Types.BIGINT);
                else statement.setLong(2, contaAlunoId);
                statement.setString(3, nome);
                statement.setString(4, responsavel.isBlank() ? null : responsavel);
                statement.setString(5, emailResponsavel.isBlank() ? null : emailResponsavel);
                statement.setString(6, necessidade.isBlank() ? null : necessidade);
                statement.executeUpdate();
                try (ResultSet keys = statement.getGeneratedKeys()) {
                    if (!keys.next()) throw new SQLException("Identificador do aluno não retornado.");
                    ApiUtil.responder(response, 201, "{\"id\":" + keys.getLong(1) + ",\"nome\":\""
                        + ApiUtil.escapar(nome) + "\",\"turmaId\":" + turmaId + "}");
                }
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao cadastrar aluno.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível cadastrar o aluno. Tente novamente.\"}");
        }
    }

    private boolean contaAlunoAtiva(Connection connection, long id) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT 1 FROM usuarios WHERE id = ? AND perfil = 'ALUNO' AND status = 'ATIVO'")) {
            statement.setLong(1, id);
            try (ResultSet result = statement.executeQuery()) {
                return result.next();
            }
        }
    }

    private boolean turmaPermitida(Connection connection, long turmaId, long usuarioId, String perfil) throws SQLException {
        String sql = perfil.equals("PROFESSOR")
            ? "SELECT 1 FROM turmas WHERE id = ? AND professor_id = ?"
            : "SELECT 1 FROM turmas WHERE id = ?";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, turmaId);
            if (perfil.equals("PROFESSOR")) statement.setLong(2, usuarioId);
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