import { generateObject, generateText } from "ai";
import type { z } from "zod";

type GenArgs<S extends z.ZodTypeAny> = Parameters<typeof generateObject<S>>[0];

/**
 * Tenta gerar um objeto tipado via IA. Se a IA falhar com erro de schema
 * ou retornar texto livre, faz um segundo passo de "reparo": pede texto puro,
 * tenta extrair JSON (inclusive dentro de blocos ```json), e em último caso
 * devolve o fallback informado.
 *
 * Nunca lança erro pro cliente: a interface sempre recebe algo renderizável.
 */
export async function safeGenerateObject<S extends z.ZodTypeAny>(
  args: GenArgs<S>,
  fallback: z.infer<S>,
  opts?: { label?: string }
): Promise<z.infer<S>> {
  const label = opts?.label ?? "ia";

  // 1) Tentativa estruturada normal
  try {
    const { object } = await generateObject(args);
    return object as z.infer<S>;
  } catch (err) {
    console.warn(`[${label}] generateObject falhou, tentando reparo:`, err instanceof Error ? err.message : err);
  }

  // 2) Reparo: pede texto livre e tenta extrair JSON
  try {
    // Reaproveita o prompt/messages originais mas remove o schema
    // (generateText aceita os mesmos campos básicos)
    const repairArgs: any = { ...args };
    delete repairArgs.schema;
    delete repairArgs.schemaName;
    delete repairArgs.schemaDescription;
    delete repairArgs.mode;
    if (typeof repairArgs.prompt === "string") {
      repairArgs.prompt =
        repairArgs.prompt +
        "\n\nIMPORTANTE: Responda APENAS com um JSON válido seguindo a estrutura pedida. Sem texto fora do JSON.";
    }

    const { text } = await generateText(repairArgs);
    const parsed = tryParseJson(text);
    if (parsed) {
      const schema = (args as any).schema as S | undefined;
      if (schema) {
        const safe = schema.safeParse(parsed);
        if (safe.success) return safe.data as z.infer<S>;
      } else {
        return parsed as z.infer<S>;
      }
    }
  } catch (err) {
    console.warn(`[${label}] reparo de JSON também falhou:`, err instanceof Error ? err.message : err);
  }

  // 3) Fallback final amigável
  console.warn(`[${label}] usando fallback estático.`);
  return fallback;
}

/**
 * Extrai JSON de uma string mesmo quando vem cercado por texto, markdown,
 * blocos ```json``` ou prefixos como "Aqui está:".
 */
export function tryParseJson(raw: string): unknown | null {
  if (!raw) return null;
  const candidates: string[] = [];

  // bloco ```json ... ```
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1]);

  // primeira { ... } balanceada (heurística simples)
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(raw.slice(firstBrace, lastBrace + 1));
  }

  // ou array [ ... ]
  const firstBracket = raw.indexOf("[");
  const lastBracket = raw.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(raw.slice(firstBracket, lastBracket + 1));
  }

  candidates.push(raw.trim());

  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      // tenta limpar vírgulas pendentes
      try {
        return JSON.parse(c.replace(/,(\s*[}\]])/g, "$1"));
      } catch {
        /* segue */
      }
    }
  }
  return null;
}

/**
 * Mensagem amigável padrão pra quando a IA "trava" no front-end.
 * Os componentes podem importar e exibir ao usuário em qualquer falha.
 */
export const MSG_IA_AMIGAVEL = "A IA está pensando… 🤔 Tente novamente em alguns segundos.";
export const MSG_IA_DEMO_FALLBACK = "Desculpe, estou aprendendo… Quer tentar outra pergunta?";
