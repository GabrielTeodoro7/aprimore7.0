import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Role = "ceo" | "admin" | "professor" | "aluno";

type Profile = {
  role?: Role;
  nome?: string;
  necessidade?: string;
};

type ChatBody = {
  messages?: UIMessage[];
  profile?: Profile;
};

function buildSystemPrompt(profile: Profile | undefined): string {
  const role = profile?.role ?? "aluno";
  const nome = profile?.nome ?? "amigo(a)";
  const need = (profile?.necessidade ?? "").toLowerCase();

  const base = [
    "Você é o assistente da plataforma Aprimore Educação — uma plataforma educacional brasileira inclusiva.",
    "Responda SEMPRE em português do Brasil, com tom acolhedor, claro e respeitoso.",
    "Nunca diagnostique nem dê conselhos médicos. Quando for sensível, sugira procurar um adulto responsável, professor(a) ou profissional de saúde.",
    "Quando útil, sugira links internos como /aluno/rotina, /aluno/comunicacao, /aluno/atividades, /aluno/conquistas, /aluno/sentimentos, /turma, /atividades, /relatorios, /admin/alunos.",
  ];

  if (role === "aluno") {
    base.push(`Você está conversando com o(a) aluno(a) ${nome}.`);
    base.push("Use frases curtas, vocabulário simples e emojis amigáveis com moderação. Ofereça uma ação por vez.");
    if (need.includes("tea") || need.includes("autis")) {
      base.push("ATENÇÃO: aluno(a) com TEA. Use linguagem literal, evite ironia/metáforas. Ofereça opções claras (1, 2, 3) e antecipe o que vai acontecer. Quando pedirem comunicação, sugira frases curtas com imagens (CAA).");
    }
    if (need.includes("tdah")) {
      base.push("ATENÇÃO: aluno(a) com TDAH. Quebre tudo em passos pequenos com checkpoints, sugira pausas curtas (foco de 10 min), comemore cada etapa concluída.");
    }
    if (need.includes("dislex")) {
      base.push("ATENÇÃO: aluno(a) com dislexia. Use frases muito curtas, evite jargões, separe ideias em linhas. Ofereça ouvir o texto em voz alta.");
    }
    if (need.includes("discalc")) {
      base.push("ATENÇÃO: aluno(a) com discalculia. Explique operações passo a passo, use representações visuais (blocos, ábaco), nomeie cada número.");
    }
    if (need.includes("ansied")) {
      base.push("ATENÇÃO: aluno(a) com ansiedade. Ofereça técnicas de respiração 4-7-8 e acolha sentimentos antes de propor tarefas.");
    }
    if (need.includes("auditiv")) {
      base.push("ATENÇÃO: aluno(a) com deficiência auditiva. Prefira texto escrito claro, evite depender de áudio, descreva sons quando relevantes.");
    }
    if (need.includes("visual") || need.includes("baixa visão")) {
      base.push("ATENÇÃO: aluno(a) com deficiência visual. Descreva imagens em palavras, ofereça leitura em voz alta e use descrições espaciais claras.");
    }
  } else if (role === "professor") {
    base.push(`Você está conversando com a(o) professor(a) ${nome}.`);
    base.push("Ajude com planos de aula adaptados, resumos de turma, ideias inclusivas e análise rápida de desempenho. Seja prático: dê exemplos concretos, listas e adaptações por necessidade (TEA, TDAH, dislexia etc.).");
  } else if (role === "admin") {
    base.push(`Você está conversando com a(o) administrador(a) ${nome}.`);
    base.push("Ajude com gestão da unidade escolar: cadastros de docentes e alunos, auditoria local, saúde da rede e conformidade com as diretrizes da plataforma.");
  } else if (role === "ceo") {
    base.push(`Você está conversando com o CEO de Onda Zero (${nome}).`);
    base.push("ACESSO SUPREMO: Forneça insights globais de infraestrutura, logs de auditoria sigilosos, estratégias de crescimento de rede e controle total sobre identidades. Seja extremamente técnico e direto.");
  }

  return base.join("\n");
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: ChatBody;
        try {
          body = (await request.json()) as ChatBody;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }

        // Cadeia de fallback de IA (todas com camada gratuita):
        // 1) LOVABLE_API_KEY (Lovable AI Gateway - Gemini)
        // 2) GEMINI_API_KEY (Google Gemini direto - free tier generoso)
        // 3) GROQ_API_KEY ou chave Groq fixa (Llama, super rápido)
        const lovableKey = process.env.LOVABLE_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        const groqKey = process.env.GROQ_API_KEY;

        let gateway;
        let model;

        if (lovableKey) {
          gateway = createLovableAiGatewayProvider(lovableKey);
          // @ts-ignore
          model = gateway("google/gemini-3-flash-preview");
        } else if (geminiKey) {
          gateway = createLovableAiGatewayProvider(geminiKey, "https://generativelanguage.googleapis.com/v1beta/openai");
          // @ts-ignore
          model = gateway("gemini-2.0-flash");
        } else {
          gateway = createLovableAiGatewayProvider(groqKey, "https://api.groq.com/openai/v1");
          // @ts-ignore
          model = gateway("llama-3.3-70b-versatile");
        }

        try {
          const result = streamText({
            model,
            system: buildSystemPrompt(body.profile),
            messages: await convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "AI error";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
