import { createServerFn } from "@tanstack/react-start";

/**
 * RN.51, 52: Gamificação.
 */
export const obterRankingAlunos = createServerFn({ method: "GET" })
  .inputValidator((escolaId: string) => escolaId)
  .handler(async ({ data: escolaId }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as any)
      .from('ranking_pontuacao')
      .select('*, profiles(nome, avatar_url)')
      .eq('profiles.escola_id', escolaId)
      .order('pontos', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  });

export const listarConquistasAluno = createServerFn({ method: "GET" })
  .inputValidator((alunoId: string) => alunoId)
  .handler(async ({ data: alunoId }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as any)
      .from('conquistas_aluno')
      .select('*, selos(*)')
      .eq('aluno_id', alunoId);

    if (error) throw error;
    return data;
  });
