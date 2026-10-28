package br.com.aprimore.servlet;

import br.com.aprimore.config.Database;
import br.com.aprimore.util.ApiUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@WebServlet("/api/atividades")
public class AtividadeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        String perfil = ApiUtil.perfil(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!ApiUtil.perfilPermitido(perfil, "ALUNO", "PROFESSOR", "ADMIN", "CEO")) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Você não tem permissão para consultar atividades.\"}");
            return;
        }

        String filtro = switch (perfil) {
            case "PROFESSOR" -> "WHERE at.professor_id = ? ";
            case "ALUNO" -> "JOIN alunos a ON a.turma_id = at.turma_id WHERE a.usuario_id = ? AND at.status = 'PUBLICADA' ";
            default -> "";
        };
        String sql = "SELECT DISTINCT at.id, at.titulo, at.materia, at.descricao, at.turma_id, t.nome AS turma_nome, "
            + "at.data_entrega, at.adaptada, at.dificuldade, at.status FROM atividades at "
            + "JOIN turmas t ON t.id = at.turma_id "
            + (perfil.equals("ALUNO") ? filtro : filtro)
            + "ORDER BY at.data_entrega IS NULL, at.data_entrega, at.titulo";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            if (!filtro.isEmpty()) statement.setLong(1, usuarioId);
            try (ResultSet rows = statement.executeQuery()) {
                StringBuilder json = new StringBuilder("[");
                while (rows.next()) {
                    if (json.length() > 1) json.append(',');
                    Date dataEntrega = rows.getDate("data_entrega");
                    json.append("{\"id\":").append(rows.getLong("id"))
                        .append(",\"titulo\":\"").append(ApiUtil.escapar(rows.getString("titulo")))
                        .append("\",\"materia\":\"").append(ApiUtil.escapar(rows.getString("materia")))
                        .append("\",\"descricao\":\"").append(ApiUtil.escapar(rows.getString("descricao")))
                        .append("\",\"turmaId\":").append(rows.getLong("turma_id"))
                        .append(",\"turmaNome\":\"").append(ApiUtil.escapar(rows.getString("turma_nome")))
                        .append("\",\"dataEntrega\":").append(dataEntrega == null ? "null" : "\"" + dataEntrega + "\"")
                        .append(",\"adaptada\":").append(rows.getBoolean("adaptada"))
                        .append(",\"dificuldade\":\"").append(ApiUtil.escapar(rows.getString("dificuldade")))
                        .append("\",\"status\":\"").append(ApiUtil.escapar(rows.getString("status"))).append("\"}");
                }
                ApiUtil.responder(response, 200, json.append(']').toString());
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar atividades.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar as atividades.\"}");
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
            ApiUtil.responder(response, 403, "{\"erro\":\"Você não tem permissão para publicar atividades.\"}");
            return;
        }

        String titulo = valor(request, "titulo");
        String materia = valor(request, "materia");
        String descricao = valor(request, "descricao");
        String turmaTexto = valor(request, "turmaId");
        String dataTexto = valor(request, "dataEntrega");
        String dificuldade = valor(request, "dificuldade").toUpperCase();
        boolean adaptada = "true".equalsIgnoreCase(valor(request, "adaptada"));
        if (titulo.length() < 3 || titulo.length() > 180 || materia.length() < 2 || materia.length() > 100
                || descricao.length() > 10000) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Confira o título, a matéria e a descrição da atividade.\"}");
            return;
        }
        if (!ApiUtil.perfilPermitido(dificuldade, "FACIL", "MEDIA", "DESAFIO")) dificuldade = "MEDIA";
        long turmaId;
        try {
            turmaId = Long.parseLong(turmaTexto);
        } catch (NumberFormatException exception) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Informe uma turma válida.\"}");
            return;
        }
        Date dataEntrega = null;
        if (!dataTexto.isBlank()) {
            try {
                dataEntrega = Date.valueOf(LocalDate.parse(dataTexto));
            } catch (DateTimeParseException exception) {
                ApiUtil.responder(response, 400, "{\"erro\":\"A data de entrega não é válida.\"}");
                return;
            }
        }

        String sql = "INSERT INTO atividades (turma_id, professor_id, titulo, materia, descricao, data_entrega, adaptada, dificuldade, status) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PUBLICADA')";
        try (Connection connection = Database.getConnection()) {
            Long professorId = professorDaTurma(connection, turmaId, usuarioId, perfil);
            if (professorId == null) {
                ApiUtil.responder(response, 403, "{\"erro\":\"A turma não existe ou você não tem permissão para publicar nela.\"}");
                return;
            }
            try (PreparedStatement statement = connection.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS)) {
                statement.setLong(1, turmaId);
                statement.setLong(2, professorId);
                statement.setString(3, titulo);
                statement.setString(4, materia);
                statement.setString(5, descricao.isBlank() ? null : descricao);
                statement.setDate(6, dataEntrega);
                statement.setBoolean(7, adaptada);
                statement.setString(8, dificuldade);
                statement.executeUpdate();
                try (ResultSet keys = statement.getGeneratedKeys()) {
                    if (!keys.next()) throw new SQLException("Identificador da atividade não retornado.");
                    ApiUtil.responder(response, 201, "{\"id\":" + keys.getLong(1) + ",\"titulo\":\""
                        + ApiUtil.escapar(titulo) + "\",\"turmaId\":" + turmaId + "}");
                }
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao publicar atividade.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível publicar a atividade.\"}");
        }
    }

    private Long professorDaTurma(Connection connection, long turmaId, long usuarioId, String perfil) throws SQLException {
        String sql = perfil.equals("PROFESSOR")
            ? "SELECT professor_id FROM turmas WHERE id = ? AND professor_id = ?"
            : "SELECT professor_id FROM turmas WHERE id = ?";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, turmaId);
            if (perfil.equals("PROFESSOR")) statement.setLong(2, usuarioId);
            try (ResultSet result = statement.executeQuery()) {
                return result.next() ? result.getLong("professor_id") : null;
            }
        }
    }

    private String valor(HttpServletRequest request, String nome) {
        String valor = request.getParameter(nome);
        return valor == null ? "" : valor.trim();
    }
}