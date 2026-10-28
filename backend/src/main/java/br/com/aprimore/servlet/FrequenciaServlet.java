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

@WebServlet("/api/frequencia")
public class FrequenciaServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        String perfil = ApiUtil.perfil(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!ApiUtil.perfilPermitido(perfil, "ALUNO", "PROFESSOR", "ADMIN", "CEO")) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Acesso não permitido.\"}");
            return;
        }
        String filter = switch (perfil) {
            case "ALUNO" -> "WHERE a.usuario_id = ? ";
            case "PROFESSOR" -> "WHERE t.professor_id = ? ";
            default -> "";
        };
        String sql = "SELECT f.id, f.aluno_id, a.nome AS aluno_nome, f.turma_id, t.nome AS turma_nome, "
            + "f.data_aula, f.presente, f.justificativa FROM frequencia f "
            + "JOIN alunos a ON a.id = f.aluno_id JOIN turmas t ON t.id = f.turma_id "
            + filter + "ORDER BY f.data_aula DESC, a.nome LIMIT 200";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            if (!filter.isEmpty()) statement.setLong(1, usuarioId);
            try (ResultSet rows = statement.executeQuery()) {
                StringBuilder json = new StringBuilder("[");
                while (rows.next()) {
                    if (json.length() > 1) json.append(',');
                    json.append("{\"id\":").append(rows.getLong("id"))
                        .append(",\"alunoId\":").append(rows.getLong("aluno_id"))
                        .append(",\"alunoNome\":\"").append(ApiUtil.escapar(rows.getString("aluno_nome")))
                        .append("\",\"turmaId\":").append(rows.getLong("turma_id"))
                        .append(",\"turmaNome\":\"").append(ApiUtil.escapar(rows.getString("turma_nome")))
                        .append("\",\"dataAula\":\"").append(rows.getDate("data_aula"))
                        .append("\",\"presente\":").append(rows.getBoolean("presente"))
                        .append(",\"justificativa\":\"").append(ApiUtil.escapar(rows.getString("justificativa"))).append("\"}");
                }
                ApiUtil.responder(response, 200, json.append(']').toString());
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar frequência.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar a frequência.\"}");
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
            ApiUtil.responder(response, 403, "{\"erro\":\"Somente a equipe pedagógica pode registrar frequência.\"}");
            return;
        }

        long alunoId;
        long turmaId;
        LocalDate data;
        try {
            alunoId = Long.parseLong(valor(request, "alunoId"));
            turmaId = Long.parseLong(valor(request, "turmaId"));
            data = LocalDate.parse(valor(request, "dataAula"));
        } catch (NumberFormatException | DateTimeParseException exception) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Informe aluno, turma e data válidos.\"}");
            return;
        }
        String presenteTexto = valor(request, "presente");
        if (!"true".equals(presenteTexto) && !"false".equals(presenteTexto)) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Selecione presença ou ausência.\"}");
            return;
        }
        String justificativa = valor(request, "justificativa");
        if (justificativa.length() > 500) {
            ApiUtil.responder(response, 400, "{\"erro\":\"A justificativa deve ter até 500 caracteres.\"}");
            return;
        }

        String permission = perfil.equals("PROFESSOR")
            ? "SELECT 1 FROM alunos a JOIN turmas t ON t.id = a.turma_id "
                + "WHERE a.id = ? AND a.turma_id = ? AND t.professor_id = ?"
            : "SELECT 1 FROM alunos a JOIN turmas t ON t.id = a.turma_id WHERE a.id = ? AND a.turma_id = ?";
        String upsert = "INSERT INTO frequencia (turma_id, aluno_id, data_aula, presente, justificativa, registrado_por) "
            + "VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE presente = VALUES(presente), "
            + "justificativa = VALUES(justificativa), registrado_por = VALUES(registrado_por)";
        try (Connection connection = Database.getConnection();
             PreparedStatement check = connection.prepareStatement(permission)) {
            check.setLong(1, alunoId);
            check.setLong(2, turmaId);
            if (perfil.equals("PROFESSOR")) check.setLong(3, usuarioId);
            try (ResultSet result = check.executeQuery()) {
                if (!result.next()) {
                    ApiUtil.responder(response, 403, "{\"erro\":\"Aluno não pertence à turma autorizada.\"}");
                    return;
                }
            }
            try (PreparedStatement statement = connection.prepareStatement(upsert)) {
                statement.setLong(1, turmaId);
                statement.setLong(2, alunoId);
                statement.setDate(3, Date.valueOf(data));
                statement.setBoolean(4, Boolean.parseBoolean(presenteTexto));
                statement.setString(5, justificativa.isBlank() ? null : justificativa);
                statement.setLong(6, usuarioId);
                statement.executeUpdate();
                ApiUtil.responder(response, 200, "{\"mensagem\":\"Frequência registrada.\"}");
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao registrar frequência.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível registrar a frequência.\"}");
        }
    }

    private String valor(HttpServletRequest request, String nome) {
        String valor = request.getParameter(nome);
        return valor == null ? "" : valor.trim();
    }
}