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

@WebServlet("/api/sentimentos")
public class SentimentoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!"ALUNO".equals(ApiUtil.perfil(request))) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Este registro pessoal está disponível somente para o próprio aluno.\"}");
            return;
        }

        String sql = "SELECT s.emocao, s.intensidade, s.observacao, s.criado_em "
            + "FROM sentimentos s JOIN alunos a ON a.id = s.aluno_id "
            + "WHERE a.usuario_id = ? ORDER BY s.criado_em DESC LIMIT 20";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, usuarioId);
            try (ResultSet rows = statement.executeQuery()) {
                StringBuilder json = new StringBuilder("[");
                while (rows.next()) {
                    if (json.length() > 1) json.append(',');
                    json.append("{\"emocao\":\"").append(ApiUtil.escapar(rows.getString("emocao")))
                        .append("\",\"intensidade\":").append(rows.getObject("intensidade") == null ? "null" : rows.getInt("intensidade"))
                        .append(",\"observacao\":\"").append(ApiUtil.escapar(rows.getString("observacao")))
                        .append("\",\"criadoEm\":\"").append(ApiUtil.escapar(rows.getString("criado_em"))).append("\"}");
                }
                ApiUtil.responder(response, 200, json.append(']').toString());
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar registros pessoais de bem-estar.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível carregar seus registros agora.\"}");
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
            ApiUtil.responder(response, 403, "{\"erro\":\"Somente o próprio aluno pode registrar seu sentimento.\"}");
            return;
        }

        String emocao = valor(request, "emocao");
        String intensidadeTexto = valor(request, "intensidade");
        String observacao = valor(request, "observacao");
        if (!ApiUtil.perfilPermitido(emocao, "FELIZ", "CALMO", "CANSADO", "ANSIOSO", "TRISTE", "FRUSTRADO")
                || observacao.length() > 500) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Selecione uma emoção válida e limite a observação a 500 caracteres.\"}");
            return;
        }
        int intensidade;
        try {
            intensidade = Integer.parseInt(intensidadeTexto);
        } catch (NumberFormatException exception) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Informe uma intensidade entre 1 e 5.\"}");
            return;
        }
        if (intensidade < 1 || intensidade > 5) {
            ApiUtil.responder(response, 400, "{\"erro\":\"A intensidade deve ficar entre 1 e 5.\"}");
            return;
        }

        String sql = "INSERT INTO sentimentos (aluno_id, emocao, intensidade, observacao) "
            + "SELECT a.id, ?, ?, ? FROM alunos a WHERE a.usuario_id = ? AND a.ativo = TRUE";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, emocao);
            statement.setInt(2, intensidade);
            statement.setString(3, observacao.isBlank() ? null : observacao);
            statement.setLong(4, usuarioId);
            if (statement.executeUpdate() == 0) {
                ApiUtil.responder(response, 409, "{\"erro\":\"Seu perfil escolar ainda não está vinculado a uma turma. Peça ajuda à equipe escolar.\"}");
                return;
            }
            ApiUtil.responder(response, 201, "{\"mensagem\":\"Registro salvo. Obrigado por compartilhar como você está.\"}");
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao registrar sentimento.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível salvar seu registro agora.\"}");
        }
    }

    private String valor(HttpServletRequest request, String nome) {
        String valor = request.getParameter(nome);
        return valor == null ? "" : valor.trim();
    }
}