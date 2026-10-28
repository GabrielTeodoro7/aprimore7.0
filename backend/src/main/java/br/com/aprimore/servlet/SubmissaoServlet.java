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

@WebServlet("/api/submissoes")
public class SubmissaoServlet extends HttpServlet {
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

        String filtro = switch (perfil) {
            case "ALUNO" -> "WHERE a.usuario_id = ? ";
            case "PROFESSOR" -> "WHERE at.professor_id = ? ";
            default -> "";
        };
        String sql = "SELECT s.id, s.atividade_id, s.aluno_id, a.nome AS aluno_nome, at.titulo, "
            + "s.resposta, s.nota, s.feedback, s.status, s.entregue_em "
            + "FROM submissoes s JOIN alunos a ON a.id = s.aluno_id "
            + "JOIN atividades at ON at.id = s.atividade_id " + filtro
            + "ORDER BY s.atualizado_em DESC";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            if (!filtro.isEmpty()) statement.setLong(1, usuarioId);
            try (ResultSet rows = statement.executeQuery()) {
                StringBuilder json = new StringBuilder("[");
                while (rows.next()) {
                    if (json.length() > 1) json.append(',');
                    json.append("{\"id\":").append(rows.getLong("id"))
                        .append(",\"atividadeId\":").append(rows.getLong("atividade_id"))
                        .append(",\"alunoId\":").append(rows.getLong("aluno_id"))
                        .append(",\"alunoNome\":\"").append(ApiUtil.escapar(rows.getString("aluno_nome")))
                        .append("\",\"titulo\":\"").append(ApiUtil.escapar(rows.getString("titulo")))
                        .append("\",\"resposta\":\"").append(ApiUtil.escapar(rows.getString("resposta")))
                        .append("\",\"nota\":").append(rows.getBigDecimal("nota") == null ? "null" : rows.getBigDecimal("nota"))
                        .append(",\"feedback\":\"").append(ApiUtil.escapar(rows.getString("feedback")))
                        .append("\",\"status\":\"").append(ApiUtil.escapar(rows.getString("status"))).append("\"}");
                }
                ApiUtil.responder(response, 200, json.append(']').toString());
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar entregas de atividades.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar as entregas.\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        Long usuarioId = ApiUtil.usuarioId(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!"ALUNO".equals(ApiUtil.perfil(request))) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Somente alunos podem enviar respostas.\"}");
            return;
        }

        long atividadeId;
        try {
            atividadeId = Long.parseLong(valor(request, "atividadeId"));
        } catch (NumberFormatException exception) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Selecione uma atividade válida.\"}");
            return;
        }
        String resposta = valor(request, "resposta");
        if (resposta.isBlank() || resposta.length() > 20000) {
            ApiUtil.responder(response, 400, "{\"erro\":\"A resposta deve ter entre 1 e 20.000 caracteres.\"}");
            return;
        }

        String lookup = "SELECT a.id FROM alunos a JOIN atividades at ON at.turma_id = a.turma_id "
            + "WHERE a.usuario_id = ? AND at.id = ? AND at.status = 'PUBLICADA' AND a.ativo = TRUE";
        String upsert = "INSERT INTO submissoes (atividade_id, aluno_id, resposta, status, entregue_em) "
            + "SELECT ?, a.id, ?, 'ENTREGUE', CURRENT_TIMESTAMP FROM alunos a "
            + "WHERE a.usuario_id = ? AND a.ativo = TRUE "
            + "ON DUPLICATE KEY UPDATE resposta = VALUES(resposta), status = 'ENTREGUE', "
            + "entregue_em = CURRENT_TIMESTAMP, atualizado_em = CURRENT_TIMESTAMP";
        try (Connection connection = Database.getConnection();
             PreparedStatement check = connection.prepareStatement(lookup)) {
            check.setLong(1, usuarioId);
            check.setLong(2, atividadeId);
            try (ResultSet result = check.executeQuery()) {
                if (!result.next()) {
                    ApiUtil.responder(response, 404, "{\"erro\":\"Atividade indisponível para esta conta.\"}");
                    return;
                }
            }
            try (PreparedStatement statement = connection.prepareStatement(upsert)) {
                statement.setLong(1, atividadeId);
                statement.setString(2, resposta);
                statement.setLong(3, usuarioId);
                int changed = statement.executeUpdate();
                if (changed == 0) {
                    ApiUtil.responder(response, 404, "{\"erro\":\"Não foi possível vincular a entrega à conta.\"}");
                    return;
                }
                ApiUtil.responder(response, 201, "{\"mensagem\":\"Resposta enviada com sucesso.\"}");
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao registrar entrega de atividade.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível enviar a resposta agora.\"}");
        }
    }

    private String valor(HttpServletRequest request, String nome) {
        String valor = request.getParameter(nome);
        return valor == null ? "" : valor.trim();
    }
}