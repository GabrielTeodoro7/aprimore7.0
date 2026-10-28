package br.com.aprimore.servlet;

import br.com.aprimore.config.Database;
import br.com.aprimore.dao.UsuarioDAO;
import br.com.aprimore.model.Usuario;
import br.com.aprimore.service.EmailService;
import br.com.aprimore.service.ValidacaoUsuario;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final UsuarioDAO usuarios = new UsuarioDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setHeader("Cache-Control", "no-store");
        if (!"/me".equals(request.getPathInfo())) {
            responder(response, 404, "{\"erro\":\"Rota não encontrada.\"}");
            return;
        }
        HttpSession sessao = request.getSession(false);
        if (sessao == null || sessao.getAttribute("usuarioId") == null) {
            responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }
        long id = (long) sessao.getAttribute("usuarioId");
        String nome = (String) sessao.getAttribute("usuarioNome");
        String email = (String) sessao.getAttribute("usuarioEmail");
        String perfil = (String) sessao.getAttribute("usuarioPerfil");
        String csrfToken = (String) sessao.getAttribute("csrfToken");
        responder(response, 200, "{\"id\":" + id + ",\"nome\":\"" + escapar(nome)
                + "\",\"email\":\"" + escapar(email) + "\",\"perfil\":\"" + escapar(perfil)
                + "\",\"csrfToken\":\"" + escapar(csrfToken) + "\"}");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setHeader("Cache-Control", "no-store");

        try {
            String rota = request.getPathInfo();
            if ("/cadastro".equals(rota)) {
                cadastrar(request, response);
            } else if ("/login".equals(rota)) {
                login(request, response);
            } else if ("/logout".equals(rota)) {
                logout(request, response);
            } else if ("/recuperacao".equals(rota)) {
                recuperarSenha(request, response);
            } else if ("/redefinir-senha".equals(rota)) {
                redefinirSenha(request, response);
            } else {
                responder(response, 404, "{\"erro\":\"Rota não encontrada.\"}");
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha na operação de autenticação.", exception);
            responder(response, 503, "{\"erro\":\"Serviço temporariamente indisponível.\"}");
        }
    }

    private void cadastrar(HttpServletRequest request, HttpServletResponse response) throws SQLException, IOException {
        String nome = parametro(request, "nome").trim();
        String email = parametro(request, "email").trim().toLowerCase(Locale.ROOT);
        String senha = request.getParameter("senha") == null ? "" : request.getParameter("senha");
        if (!ValidacaoUsuario.nomeValido(nome)
                || !ValidacaoUsuario.emailValido(email)
                || !ValidacaoUsuario.senhaValida(senha)) {
            responder(response, 400, "{\"erro\":\"Informe nome e e-mail válidos e senha entre 10 e 72 bytes.\"}");
            return;
        }
        if (usuarios.buscarPorEmail(email).isPresent()) {
            responder(response, 409, "{\"erro\":\"Não foi possível criar a conta com esses dados.\"}");
            return;
        }
        Usuario usuario = usuarios.criar(nome, email, BCrypt.hashpw(senha, BCrypt.gensalt(12)));
        criarSessao(request, usuario);
        responder(response, 201, json(usuario));
    }

    private void login(HttpServletRequest request, HttpServletResponse response) throws SQLException, IOException {
        String email = parametro(request, "email").trim().toLowerCase(Locale.ROOT);
        String senha = request.getParameter("senha") == null ? "" : request.getParameter("senha");
        Optional<UsuarioDAO.CredencialUsuario> credencial = usuarios.buscarCredencialPorEmail(email);
        if (credencial.isEmpty() || !credencial.get().ativo()
                || !ValidacaoUsuario.senhaValida(senha)
                || !BCrypt.checkpw(senha, credencial.get().senhaHash())) {
            responder(response, 401, "{\"erro\":\"E-mail ou senha inválidos.\"}");
            return;
        }
        try {
            usuarios.registrarAcesso(credencial.get().usuario().id());
        } catch (SQLException exception) {
            getServletContext().log("Não foi possível atualizar a data do último acesso.", exception);
        }
        criarSessao(request, credencial.get().usuario());
        responder(response, 200, json(credencial.get().usuario()));
    }

    private void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession sessao = request.getSession(false);
        if (sessao != null) sessao.invalidate();
        responder(response, 200, "{\"mensagem\":\"Sessão encerrada.\"}");
    }

    private void recuperarSenha(HttpServletRequest request, HttpServletResponse response) throws IOException, SQLException {
        String email = parametro(request, "email").trim().toLowerCase(Locale.ROOT);
        String mensagem = "{\"mensagem\":\"Se a conta estiver cadastrada e o e-mail configurado, você receberá instruções de recuperação.\"}";
        if (!ValidacaoUsuario.emailValido(email)) {
            responder(response, 200, mensagem);
            return;
        }

        Optional<UsuarioDAO.CredencialUsuario> credencial = usuarios.buscarCredencialPorEmail(email);
        if (credencial.isEmpty() || !credencial.get().ativo()) {
            responder(response, 200, mensagem);
            return;
        }

        byte[] tokenBytes = new byte[32];
        RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        String tokenHash = hashToken(token);
        long usuarioId = credencial.get().usuario().id();
        try (Connection connection = Database.getConnection();
             PreparedStatement cleanup = connection.prepareStatement(
                 "DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP "
                     + "OR used_at IS NOT NULL OR usuario_id = ?")) {
            cleanup.setLong(1, usuarioId);
            cleanup.executeUpdate();
            try (PreparedStatement insert = connection.prepareStatement(
                    "INSERT INTO password_reset_tokens (usuario_id, token_hash, expires_at) "
                        + "VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE))")) {
                insert.setLong(1, usuarioId);
                insert.setString(2, tokenHash);
                insert.executeUpdate();
            }
        }

        try {
            EmailService.enviarTokenRecuperacao(email, token);
        } catch (jakarta.mail.MessagingException | IllegalStateException exception) {
            getServletContext().log("Não foi possível enviar o e-mail de recuperação.", exception);
            try (Connection connection = Database.getConnection();
                 PreparedStatement delete = connection.prepareStatement(
                     "DELETE FROM password_reset_tokens WHERE token_hash = ?")) {
                delete.setString(1, tokenHash);
                delete.executeUpdate();
            }
        }
        responder(response, 200, mensagem);
    }

    private void redefinirSenha(HttpServletRequest request, HttpServletResponse response) throws IOException, SQLException {
        String token = parametro(request, "token").trim();
        String senha = request.getParameter("senha") == null ? "" : request.getParameter("senha");
        if (token.length() < 30 || token.length() > 100 || !ValidacaoUsuario.senhaValida(senha)) {
            responder(response, 400, "{\"erro\":\"Código inválido ou senha fora dos critérios de segurança.\"}");
            return;
        }

        String tokenHash = hashToken(token);
        try (Connection connection = Database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                long usuarioId;
                try (PreparedStatement select = connection.prepareStatement(
                        "SELECT usuario_id FROM password_reset_tokens WHERE token_hash = ? "
                            + "AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP FOR UPDATE")) {
                    select.setString(1, tokenHash);
                    try (ResultSet result = select.executeQuery()) {
                        if (!result.next()) {
                            connection.rollback();
                            responder(response, 400, "{\"erro\":\"Código inválido ou expirado. Solicite uma nova recuperação.\"}");
                            return;
                        }
                        usuarioId = result.getLong("usuario_id");
                    }
                }

                try (PreparedStatement update = connection.prepareStatement(
                        "UPDATE usuarios SET senha_hash = ? WHERE id = ? AND status = 'ATIVO'")) {
                    update.setString(1, BCrypt.hashpw(senha, BCrypt.gensalt(12)));
                    update.setLong(2, usuarioId);
                    if (update.executeUpdate() != 1) {
                        connection.rollback();
                        responder(response, 400, "{\"erro\":\"Não foi possível redefinir esta conta.\"}");
                        return;
                    }
                }

                try (PreparedStatement consume = connection.prepareStatement(
                        "UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP "
                            + "WHERE usuario_id = ? AND used_at IS NULL")) {
                    consume.setLong(1, usuarioId);
                    consume.executeUpdate();
                }
                connection.commit();
                responder(response, 200, "{\"mensagem\":\"Senha redefinida. Entre usando sua nova senha.\"}");
            } catch (SQLException | RuntimeException exception) {
                connection.rollback();
                throw exception;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (IllegalStateException exception) {
            getServletContext().log("Falha ao redefinir a senha.", exception);
            responder(response, 503, "{\"erro\":\"Serviço temporariamente indisponível.\"}");
        }
    }

    private String hashToken(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 não está disponível.", exception);
        }
    }

    private void criarSessao(HttpServletRequest request, Usuario usuario) {
        HttpSession anterior = request.getSession(false);
        if (anterior != null) anterior.invalidate();
        HttpSession sessao = request.getSession(true);
        sessao.setAttribute("usuarioId", usuario.id());
        sessao.setAttribute("usuarioNome", usuario.nome());
        sessao.setAttribute("usuarioEmail", usuario.email());
        sessao.setAttribute("usuarioPerfil", usuario.perfil());
        byte[] token = new byte[32];
        RANDOM.nextBytes(token);
        sessao.setAttribute("csrfToken", Base64.getUrlEncoder().withoutPadding().encodeToString(token));
        sessao.setMaxInactiveInterval(1800);
    }

    private String parametro(HttpServletRequest request, String nome) {
        String valor = request.getParameter(nome);
        return valor == null ? "" : valor;
    }

    private String json(Usuario usuario) {
        return "{\"id\":" + usuario.id() + ",\"nome\":\"" + escapar(usuario.nome())
                + "\",\"email\":\"" + escapar(usuario.email()) + "\",\"perfil\":\""
                + escapar(usuario.perfil()) + "\"}";
    }

    private String escapar(String valor) {
        StringBuilder resultado = new StringBuilder(valor.length());
        for (int i = 0; i < valor.length(); i++) {
            char caractere = valor.charAt(i);
            switch (caractere) {
                case '\\' -> resultado.append("\\\\");
                case '"' -> resultado.append("\\\"");
                case '\n' -> resultado.append("\\n");
                case '\r' -> resultado.append("\\r");
                case '\t' -> resultado.append("\\t");
                case '\b' -> resultado.append("\\b");
                case '\f' -> resultado.append("\\f");
                default -> {
                    if (caractere < 0x20) {
                        resultado.append(String.format("\\u%04x", (int) caractere));
                    } else {
                        resultado.append(caractere);
                    }
                }
            }
        }
        return resultado.toString();
    }

    private void responder(HttpServletResponse response, int status, String corpo) throws IOException {
        response.setStatus(status);
        response.getWriter().write(corpo);
    }
}