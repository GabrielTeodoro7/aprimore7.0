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

@WebServlet("/api/auditoria")
public class AuditoriaServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!ApiUtil.perfilPermitido(ApiUtil.perfil(request), "ADMIN", "CEO")) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Somente administradores autorizados podem consultar a auditoria.\"}");
            return;
        }

        String sql = "SELECT a.id, a.usuario_id, u.nome AS usuario_nome, a.acao, a.entidade, "
                + "a.entidade_id, a.ip_origem, a.criado_em "
                + "FROM audit_logs a LEFT JOIN usuarios u ON u.id = a.usuario_id "
                + "ORDER BY a.criado_em DESC LIMIT 100";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet rows = statement.executeQuery()) {
            StringBuilder json = new StringBuilder("[");
            while (rows.next()) {
                if (json.length() > 1) json.append(',');
                long entidadeId = rows.getLong("entidade_id");
                boolean entidadeIdNulo = rows.wasNull();
                json.append("{\"id\":").append(rows.getLong("id"))
                    .append(",\"usuarioNome\":\"").append(ApiUtil.escapar(rows.getString("usuario_nome")))
                    .append("\",\"acao\":\"").append(ApiUtil.escapar(rows.getString("acao")))
                    .append("\",\"entidade\":\"").append(ApiUtil.escapar(rows.getString("entidade")))
                    .append("\",\"entidadeId\":").append(entidadeIdNulo ? "null" : entidadeId)
                    .append(",\"ipOrigem\":\"").append(ApiUtil.escapar(rows.getString("ip_origem")))
                    .append("\",\"criadoEm\":\"").append(ApiUtil.escapar(rows.getString("criado_em"))).append("\"}");
            }
            ApiUtil.responder(response, 200, json.append(']').toString());
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar o histórico de auditoria.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar o histórico de auditoria.\"}");
        }
    }
}