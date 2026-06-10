import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Nivel = "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";

function classificar(media: number, freq: number): Nivel {
  if (media < 4 || freq < 60) return "CRITICO";
  if (media < 5 || freq < 70) return "ALTO";
  if (media < 6 || freq < 80) return "MEDIO";
  return "BAIXO";
}

/**
 * RN.57 — Calcular e registrar risco acadêmico de um aluno.
 */
export const calcularRiscoAcademico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    alunoId: string;
    mediaGeral: number;
    frequenciaPct: number;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context as { supabase: any };
    const nivel = classificar(data.mediaGeral, data.frequenciaPct);
    const { data: row, error } = await supabase
      .from("riscos_academicos")
      .insert({
        aluno_id: data.alunoId,
        nivel,
        indicadores: { media: data.mediaGeral, frequencia: data.frequenciaPct },
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

/**
 * RN.56 — Registrar sugestão pedagógica para um aluno.
 */
export const registrarSugestaoPedagogica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    alunoId: string;
    sugestao: string;
    prioridade?: "BAIXA" | "MEDIA" | "ALTA";
    contexto?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data: row, error } = await supabase
      .from("sugestoes_pedagogicas")
      .insert({
        aluno_id: data.alunoId,
        professor_id: userId,
        sugestao: data.sugestao,
        prioridade: data.prioridade ?? "MEDIA",
        contexto: data.contexto,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

/**
 * RN.60 — Consultar limite de uso da IA do usuário autenticado.
 */
export const consultarLimiteIA = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data, error } = await supabase
      .from("ia_limites_uso")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data ?? { requisicoes_hoje: 0, limite_diario: 100 };
  });
