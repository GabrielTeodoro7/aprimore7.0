package br.com.aprimore.servlet;

import br.com.aprimore.dao.UsuarioDAO;
import br.com.aprimore.model.Usuario;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Locale;
import java.util.Optional;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    private final UsuarioDAO usuarios = new UsuarioDAO();

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
            } else {
                responder(response, 404, "{\"erro\":\"Rota não encontrada.\"}");
            }
        } catch (SQLException | IllegalStateException exception) {
            getServletContext().log("Falha na operação de autenticação.", exception);
            responder(response, 503, "{\"erro\":\"Serviço temporariamente indisponível.\"}");
        }
    }

    private void cadastrar(HttpServletRequest request, HttpServletResponse response) throws SQLException, IOException {
        String nome = parametro(request, "nome");
        String email = parametro(request, "email").toLowerCase(Locale.ROOT);
        String senha = parametro(request, "senha");
        if (nome.length() < 2 || nome.length() > 100
                || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || senha.length() < 10 || senha.length() > 72) {
            responder(response, 400, "{\"erro\":\"Informe nome e e-mail válidos e senha entre 10 e 72 caracteres.\"}");
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
        String email = parametro(request, "email").toLowerCase(Locale.ROOT);
        String senha = parametro(request, "senha");
        Optional<Usuario> usuario = usuarios.buscarPorEmail(email);
        Optional<String> hash = usuarios.buscarHashSenha(email);
        if (usuario.isEmpty() || hash.isEmpty() || !BCrypt.checkpw(senha, hash.get())) {
            responder(response, 401, "{\"erro\":\"E-mail ou senha inválidos.\"}");
            return;
        }
        criarSessao(request, usuario.get());
        responder(response, 200, json(usuario.get()));
    }

    private void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession sessao = request.getSession(false);
        if (sessao != null) sessao.invalidate();
        responder(response, 200, "{\"mensagem\":\"Sessão encerrada.\"}");
    }

    private void criarSessao(HttpServletRequest request, Usuario usuario) {
        HttpSession anterior = request.getSession(false);
        if (anterior != null) anterior.invalidate();
        HttpSession sessao = request.getSession(true);
        sessao.setAttribute("usuarioId", usuario.id());
        sessao.setAttribute("usuarioPerfil", usuario.perfil());
        sessao.setMaxInactiveInterval(1800);
    }

    private String parametro(HttpServletRequest request, String nome) {
        String valor = request.getParameter(nome);
        return valor == null ? "" : valor.trim();
    }

    private String json(Usuario usuario) {
        return "{\"id\":" + usuario.id() + ",\"nome\":\"" + escapar(usuario.nome())
                + "\",\"email\":\"" + escapar(usuario.email()) + "\",\"perfil\":\""
                + escapar(usuario.perfil()) + "\"}";
    }

    private String escapar(String valor) {
        return valor.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r");
    }

    private void responder(HttpServletResponse response, int status, String corpo) throws IOException {
        response.setStatus(status);
        response.getWriter().write(corpo);
    }
}