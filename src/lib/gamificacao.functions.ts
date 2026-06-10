import { createServerFn } from "@tanstack/react-start";

/**
 * RN.51, 52: Gamificação.
 */
export const obterRankingAlunos = createServerFn({ method: "GET" })
  .inputValidator((escolaId: string) => escolaId)
  .handler(async ({ data: escolaId }) => {
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;

    const { data, error } = await supabaseAdmin
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
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;

    const { data, error } = await supabaseAdmin
      .from('conquistas_aluno')
      .select('*, selos(*)')
      .eq('aluno_id', alunoId);

    if (error) throw error;
    return data;
  });
