import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const createLovableAiGatewayProvider = (lovableApiKey: string, baseURL?: string) =>
  createOpenAICompatible({
    name: "lovable",
    baseURL: baseURL || "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      ...(lovableApiKey?.startsWith("gsk_") ? { "Authorization": `Bearer ${lovableApiKey}` } : {})
    },
  });
