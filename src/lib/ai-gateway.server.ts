import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Provider unificado:
 *  - Sem baseURL → Lovable AI Gateway (header `Lovable-API-Key`).
 *  - Com baseURL externo (Gemini OpenAI-compat, Groq, OpenRouter etc.) → usa
 *    `Authorization: Bearer <key>` que é o padrão OpenAI esperado por essas APIs.
 *    Sem esse header, Gemini/Groq devolvem 401 e a IA "para".
 */
export const createLovableAiGatewayProvider = (apiKey: string, baseURL?: string) => {
  const isExternal = !!baseURL && !baseURL.includes("ai.gateway.lovable.dev");

  if (isExternal) {
    return createOpenAICompatible({
      name: "external",
      baseURL: baseURL!,
      apiKey,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
  }

  return createOpenAICompatible({
    name: "lovable",
    baseURL: baseURL || "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
};
