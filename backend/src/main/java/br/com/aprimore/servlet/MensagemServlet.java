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

@WebServlet("/api/mensagens")
public class MensagemServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        String sql = "SELECT m.id, m.remetente_id, r.nome AS remetente_nome, m.destinatario_id, "
            + "d.nome AS destinatario_nome, m.assunto, m.conteudo, m.lida_em, m.criado_em "
            + "FROM mensagens m JOIN usuarios r ON r.id = m.remetente_id "
            + "JOIN usuarios d ON d.id = m.destinatario_id "
            + "WHERE m.remetente_id = ? OR m.destinatario_id = ? "
            + "ORDER BY m.criado_em DESC LIMIT 100";
        try (Connection connection = Database.getConnection()) {
            try (PreparedStatement markRead = connection.prepareStatement(
                    "UPDATE mensagens SET lida_em = CURRENT_TIMESTAMP WHERE destinatario_id = ? AND lida_em IS NULL")) {
                markRead.setLong(1, usuarioId);
                markRead.executeUpdate();
            }
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setLong(1, usuarioId);
                statement.setLong(2, usuarioId);
                try (ResultSet rows = statement.executeQuery()) {
                    StringBuilder json = new StringBuilder("[");
                    while (rows.next()) {
                        if (json.length() > 1) json.append(',');
                        json.append("{\"id\":").append(rows.getLong("id"))
                            .append(",\"remetenteId\":").append(rows.getLong("remetente_id"))
                            .append(",\"remetenteNome\":\"").append(ApiUtil.escapar(rows.getString("remetente_nome")))
                            .append("\",\"destinatarioId\":").append(rows.getLong("destinatario_id"))
                            .append(",\"destinatarioNome\":\"").append(ApiUtil.escapar(rows.getString("destinatario_nome")))
                            .append("\",\"assunto\":\"").append(ApiUtil.escapar(rows.getString("assunto")))
                            .append("\",\"conteudo\":\"").append(ApiUtil.escapar(rows.getString("conteudo")))
                            .append("\",\"recebida\":").append(rows.getLong("destinatario_id") == usuarioId)
                            .append(",\"lida\":").append(rows.getTimestamp("lida_em") != null)
                            .append(",\"criadoEm\":\"").append(ApiUtil.escapar(rows.getString("criado_em"))).append("\"}");
                    }
                    ApiUtil.responder(response, 200, json.append(']').toString());
                }
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar mensagens.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar as mensagens.\"}");
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
        long destinatarioId;
        try {
            destinatarioId = Long.parseLong(valor(request, "destinatarioId"));
        } catch (NumberFormatException exception) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Selecione um destinatário válido.\"}");
            return;
        }
        String assunto = valor(request, "assunto");
        String conteudo = valor(request, "conteudo");
        if (destinatarioId == usuarioId || assunto.length() < 2 || assunto.length() > 180
                || conteudo.isBlank() || conteudo.length() > 10000) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Confira o destinatário, o assunto e o tamanho da mensagem.\"}");
            return;
        }

        String sqlDestinatario = perfil.equals("ALUNO")
            ? "SELECT 1 FROM usuarios WHERE id = ? AND status = 'ATIVO' AND perfil IN ('PROFESSOR', 'ADMIN', 'CEO')"
            : "SELECT 1 FROM usuarios WHERE id = ? AND status = 'ATIVO'";
        String sqlInsert = "INSERT INTO mensagens (remetente_id, destinatario_id, assunto, conteudo) VALUES (?, ?, ?, ?)";
        try (Connection connection = Database.getConnection();
             PreparedStatement check = connection.prepareStatement(sqlDestinatario)) {
            check.setLong(1, destinatarioId);
            try (ResultSet result = check.executeQuery()) {
                if (!result.next()) {
                    ApiUtil.responder(response, 404, "{\"erro\":\"Destinatário não encontrado ou não permitido.\"}");
                    return;
                }
            }
            try (PreparedStatement statement = connection.prepareStatement(sqlInsert)) {
                statement.setLong(1, usuarioId);
                statement.setLong(2, destinatarioId);
                statement.setString(3, assunto);
                statement.setString(4, conteudo);
                statement.executeUpdate();
                ApiUtil.responder(response, 201, "{\"mensagem\":\"Mensagem enviada.\"}");
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao enviar mensagem.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível enviar a mensagem.\"}");
        }
    }

    private String valor(HttpServletRequest request, String nome) {
        String valor = request.getParameter(nome);
        return valor == null ? "" : valor.trim();
    }
}