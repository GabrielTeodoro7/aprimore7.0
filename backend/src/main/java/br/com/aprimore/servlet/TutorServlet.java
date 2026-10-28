package br.com.aprimore.servlet;

import br.com.aprimore.util.ApiUtil;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.json.JsonWriter;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@WebServlet("/api/ia/tutor")
public class TutorServlet extends HttpServlet {
    private static final HttpClient CLIENT = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(8))
        .build();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        if (ApiUtil.usuarioId(request) == null) {
            ApiUtil.responder(response, 401, "{\"erro\":\"Autenticação necessária.\"}");
            return;
        }

        String pergunta = request.getParameter("pergunta");
        pergunta = pergunta == null ? "" : pergunta.trim();
        if (pergunta.isBlank() || pergunta.length() > 3000) {
            ApiUtil.responder(response, 400, "{\"erro\":\"Escreva uma pergunta com até 3.000 caracteres.\"}");
            return;
        }

        String apiKey = System.getenv("AI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            ApiUtil.responder(response, 503, "{\"erro\":\"O tutor ainda não foi configurado pelo administrador.\"}");
            return;
        }

        String endpoint = System.getenv().getOrDefault("AI_API_URL", "https://api.openai.com/v1/chat/completions");
        String model = System.getenv().getOrDefault("AI_MODEL", "gpt-4o-mini");
        URI uri;
        try {
            uri = URI.create(endpoint);
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null) {
                throw new IllegalArgumentException("O provedor deve usar HTTPS.");
            }
        } catch (IllegalArgumentException exception) {
            getServletContext().log("A URL configurada para o tutor é inválida.", exception);
            ApiUtil.responder(response, 503, "{\"erro\":\"Configuração do tutor inválida.\"}");
            return;
        }

        JsonObject payload = Json.createObjectBuilder()
            .add("model", model)
            .add("temperature", 0.4)
            .add("messages", Json.createArrayBuilder()
                .add(Json.createObjectBuilder()
                    .add("role", "system")
                    .add("content", "Você é o Tutor Aprimore, um assistente pedagógico acolhedor. Responda em português do Brasil, com linguagem simples, exemplos práticos e etapas curtas. Incentive o raciocínio, não julgue o estudante e não solicite dados pessoais. Se a pergunta envolver saúde, segurança ou risco, oriente a procurar um adulto responsável ou profissional adequado."))
                .add(Json.createObjectBuilder().add("role", "user").add("content", pergunta)))
            .build();

        StringWriter bodyWriter = new StringWriter();
        try (JsonWriter jsonWriter = Json.createWriter(bodyWriter)) {
            jsonWriter.writeObject(payload);
        }

        HttpRequest apiRequest = HttpRequest.newBuilder(uri)
            .timeout(Duration.ofSeconds(30))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(bodyWriter.toString()))
            .build();

        try {
            HttpResponse<String> apiResponse = CLIENT.send(apiRequest, HttpResponse.BodyHandlers.ofString());
            if (apiResponse.statusCode() < 200 || apiResponse.statusCode() >= 300) {
                getServletContext().log("O provedor do tutor retornou HTTP " + apiResponse.statusCode() + ".");
                ApiUtil.responder(response, 502, "{\"erro\":\"O tutor não conseguiu responder agora. Tente novamente.\"}");
                return;
            }

            try (JsonReader reader = Json.createReader(new StringReader(apiResponse.body()))) {
                JsonObject result = reader.readObject();
                JsonArray choices = result.getJsonArray("choices");
                if (choices == null || choices.isEmpty()) {
                    ApiUtil.responder(response, 502, "{\"erro\":\"A resposta do tutor veio vazia.\"}");
                    return;
                }
                JsonObject message = choices.getJsonObject(0).getJsonObject("message");
                String answer = message == null ? "" : message.getString("content", "");
                if (answer.isBlank()) {
                    ApiUtil.responder(response, 502, "{\"erro\":\"A resposta do tutor veio vazia.\"}");
                    return;
                }
                ApiUtil.responder(response, 200, "{\"resposta\":\"" + ApiUtil.escapar(answer) + "\"}");
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            ApiUtil.responder(response, 503, "{\"erro\":\"A solicitação foi interrompida. Tente novamente.\"}");
        } catch (IOException | IllegalStateException exception) {
            getServletContext().log("Falha ao consultar o serviço pedagógico.", exception);
            ApiUtil.responder(response, 502, "{\"erro\":\"Não foi possível conectar ao tutor.\"}");
        }
    }
}