package br.com.aprimore.servlet;

import br.com.aprimore.config.Database;
import br.com.aprimore.util.ApiUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/api/correcoes")
public class CorrecaoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        String perfil = ApiUtil.perfil(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!ApiUtil.perfilPermitido(perfil, "PROFESSOR", "ADMIN", "CEO")) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Acesso permitido somente à equipe pedagógica.\"}");
            return;
        }

        String filtro = perfil.equals("PROFESSOR") ? "WHERE at.professor_id = ? " : "";
        String sql = "SELECT s.id, s.atividade_id, s.aluno_id, a.nome AS aluno_nome, at.titulo, "
            + "s.resposta, s.nota, s.feedback, s.status, s.entregue_em "
            + "FROM submissoes s JOIN alunos a ON a.id = s.aluno_id "
            + "JOIN atividades at ON at.id = s.atividade_id " + filtro
            + "ORDER BY s.entregue_em DESC";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            if (!filtro.isEmpty()) statement.setLong(1, usuarioId);
            try (ResultSet rows = statement.executeQuery()) {
                StringBuilder json = new StringBuilder("[");
                while (rows.next()) {
                    if (json.length() > 1) json.append(',');
                    BigDecimal nota = rows.getBigDecimal("nota");
                    json.append("{\"id\":").append(rows.getLong("id"))
                        .append(",\"atividadeId\":").append(rows.getLong("atividade_id"))
                        .append(",\"alunoNome\":\"").append(ApiUtil.escapar(rows.getString("aluno_nome")))
                        .append("\",\"titulo\":\"").append(ApiUtil.escapar(rows.getString("titulo")))
                        .append("\",\"resposta\":\"").append(ApiUtil.escapar(rows.getString("resposta")))
                        .append("\",\"nota\":").append(nota == null ? "null" : nota)
                        .append(",\"feedback\":\"").append(ApiUtil.escapar(rows.getString("feedback")))
                        .append("\",\"status\":\"").append(ApiUtil.escapar(rows.getString("status"))).append("\"}");
                }
                ApiUtil.responder(response, 200, json.append(']').toString());
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar respostas para correção.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar as respostas.\"}");
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
            ApiUtil.responder(response, 403, "{\"erro\":\"Você não tem permissão para corrigir atividades.\"}");
            return;
        }

        long submissaoId;
        BigDecimal nota;
        try {
            submissaoId = Long.parseLong(valor(request, "submissaoId"));
            nota = new BigDecimal(valor(request, "nota"));
        } catch (NumberFormatException exception) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Informe uma entrega e uma nota válidas.\"}");
            return;
        }
        String feedback = valor(request, "feedback");
        if (submissaoId < 1 || nota.compareTo(BigDecimal.ZERO) < 0
                || nota.compareTo(BigDecimal.TEN) > 0 || nota.scale() > 2 || feedback.length() > 2000) {
            ApiUtil.responder(response, 400, "{\"erro\":\"A nota deve estar entre 0 e 10, com até duas casas decimais.\"}");
            return;
        }

        String sql = "UPDATE submissoes s JOIN atividades at ON at.id = s.atividade_id "
            + "SET s.nota = ?, s.feedback = ?, s.status = 'CORRIGIDA', s.atualizado_em = CURRENT_TIMESTAMP "
            + "WHERE s.id = ? AND (? <> 'PROFESSOR' OR at.professor_id = ?)";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setBigDecimal(1, nota);
            statement.setString(2, feedback.isBlank() ? null : feedback);
            statement.setLong(3, submissaoId);
            statement.setString(4, perfil);
            statement.setLong(5, usuarioId);
            if (statement.executeUpdate() == 0) {
                ApiUtil.responder(response, 404, "{\"erro\":\"Entrega não encontrada ou fora das suas turmas.\"}");
                return;
            }
            ApiUtil.responder(response, 200, "{\"mensagem\":\"Correção salva com sucesso.\"}");
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao corrigir entrega de atividade.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível salvar a correção.\"}");
        }
    }

    private String valor(HttpServletRequest request, String nome) {
        String valor = request.getParameter(nome);
        return valor == null ? "" : valor.trim();
    }
}