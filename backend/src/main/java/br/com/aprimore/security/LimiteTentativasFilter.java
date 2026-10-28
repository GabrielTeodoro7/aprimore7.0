package br.com.aprimore.security;

import br.com.aprimore.util.ApiUtil;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@WebFilter(urlPatterns = {"/api/auth/login", "/api/auth/recuperacao"})
public class LimiteTentativasFilter implements Filter {
    private static final long JANELA_MS = 15 * 60 * 1000L;
    private static final int MAXIMO_CHAVES = 10_000;
    private static final Map<String, Janela> JANELAS = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest requisicao = (HttpServletRequest) request;
        HttpServletResponse resposta = (HttpServletResponse) response;

        if (!"POST".equalsIgnoreCase(requisicao.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String uri = requisicao.getRequestURI();
        String caminho = uri.substring(requisicao.getContextPath().length());
        int limite = "/api/auth/recuperacao".equals(caminho) ? 5 : 10;
        String chave = caminho + "|" + requisicao.getRemoteAddr();
        long agora = System.currentTimeMillis();

        if (!permitir(chave, limite, agora, JANELA_MS)) {
            resposta.setHeader("Retry-After", String.valueOf(segundosRestantes(chave, agora, JANELA_MS)));
            ApiUtil.responder(resposta, 429,
                "{\"erro\":\"Muitas tentativas em pouco tempo. Aguarde 15 minutos e tente novamente.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    static synchronized boolean permitir(String chave, int limite, long agora, long janelaMs) {
        if (limite < 1 || janelaMs < 1) {
            throw new IllegalArgumentException("O limite e a duração da janela devem ser positivos.");
        }

        if (!JANELAS.containsKey(chave) && JANELAS.size() >= MAXIMO_CHAVES) {
            JANELAS.entrySet().removeIf(entrada ->
                agora - entrada.getValue().inicio >= janelaMs || agora < entrada.getValue().inicio);
            if (JANELAS.size() >= MAXIMO_CHAVES) {
                return false;
            }
        }

        Janela janela = JANELAS.compute(chave, (ignorada, atual) -> {
            if (atual == null || agora - atual.inicio >= janelaMs || agora < atual.inicio) {
                return new Janela(agora, 1);
            }
            return new Janela(atual.inicio, atual.tentativas + 1);
        });

        return janela.tentativas <= limite;
    }

    private static long segundosRestantes(String chave, long agora, long janelaMs) {
        Janela janela = JANELAS.get(chave);
        if (janela == null) return Math.max(1, janelaMs / 1000);
        long restante = janela.inicio + janelaMs - agora;
        return Math.max(1, (restante + 999) / 1000);
    }

    private record Janela(long inicio, int tentativas) {
    }
}
