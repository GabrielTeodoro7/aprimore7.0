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

@WebServlet("/api/relatorios/resumo")
public class RelatorioServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Long usuarioId = ApiUtil.usuarioId(request);
        String perfil = ApiUtil.perfil(request);
        if (usuarioId == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        if (!ApiUtil.perfilPermitido(perfil, "ADMIN", "CEO")) {
            ApiUtil.responder(response, 403, "{\"erro\":\"Somente administradores autorizados podem acessar os relatórios gerais.\"}");
            return;
        }

        String sql = "SELECT "
            + "(SELECT COUNT(*) FROM usuarios WHERE status = 'ATIVO') AS usuarios_ativos, "
            + "(SELECT COUNT(*) FROM usuarios WHERE perfil = 'ALUNO' AND status = 'ATIVO') AS alunos_ativos, "
            + "(SELECT COUNT(*) FROM usuarios WHERE perfil = 'PROFESSOR' AND status = 'ATIVO') AS professores_ativos, "
            + "(SELECT COUNT(*) FROM turmas) AS turmas, "
            + "(SELECT COUNT(*) FROM alunos WHERE ativo = TRUE) AS perfis_aluno, "
            + "(SELECT COUNT(*) FROM atividades WHERE status = 'PUBLICADA') AS atividades_publicadas, "
            + "(SELECT COUNT(*) FROM submissoes WHERE status = 'ENTREGUE') AS entregas_pendentes, "
            + "(SELECT COUNT(*) FROM submissoes WHERE status = 'CORRIGIDA') AS entregas_corrigidas, "
            + "(SELECT COUNT(*) FROM frequencia WHERE presente = TRUE) AS presencas, "
            + "(SELECT COUNT(*) FROM frequencia) AS registros_frequencia";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet result = statement.executeQuery()) {
            if (!result.next()) {
                ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível gerar o resumo.\"}");
                return;
            }
            String json = "{\"usuariosAtivos\":" + result.getLong("usuarios_ativos")
                + ",\"alunosAtivos\":" + result.getLong("alunos_ativos")
                + ",\"professoresAtivos\":" + result.getLong("professores_ativos")
                + ",\"turmas\":" + result.getLong("turmas")
                + ",\"perfisAluno\":" + result.getLong("perfis_aluno")
                + ",\"atividadesPublicadas\":" + result.getLong("atividades_publicadas")
                + ",\"entregasPendentes\":" + result.getLong("entregas_pendentes")
                + ",\"entregasCorrigidas\":" + result.getLong("entregas_corrigidas")
                + ",\"presencas\":" + result.getLong("presencas")
                + ",\"registrosFrequencia\":" + result.getLong("registros_frequencia") + "}";
            ApiUtil.responder(response, 200, json);
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha ao gerar relatório administrativo.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Não foi possível gerar o resumo administrativo.\"}");
        }
    }
}