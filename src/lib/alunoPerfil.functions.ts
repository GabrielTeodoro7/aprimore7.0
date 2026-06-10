import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AnyClient = { from: (t: string) => any };

export const getMeuAlunoPerfil = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data: prof } = await sb
      .from("profiles")
      .select("id, nome, diagnostico, config_a11y")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!prof) return null;
    const { data: aluno, error } = await sb
      .from("alunos")
      .select("id, nome, turma_id, estrelas")
      .eq("profile_id", prof.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!aluno) return null;
    return {
      id: aluno.id as string,
      nome: (aluno.nome ?? prof.nome) as string,
      turmaId: aluno.turma_id as string,
      profileId: prof.id as string,
      estrelas: (aluno.estrelas ?? 0) as number,
      diagnostico: (prof.diagnostico ?? {}) as Record<string, any>,
      config_a11y: (prof.config_a11y ?? {}) as Record<string, any>,
    };
  });

export const addEstrelas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      alunoId: z.string().uuid(),
      delta: z.number().int().min(-1000).max(1000),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data: cur, error: e1 } = await sb
      .from("alunos")
      .select("estrelas")
      .eq("id", data.alunoId)
      .single();
    if (e1) throw new Error(e1.message);
    const next = Math.max(0, ((cur?.estrelas ?? 0) as number) + data.delta);
    const { error: e2 } = await sb
      .from("alunos")
      .update({ estrelas: next })
      .eq("id", data.alunoId);
    if (e2) throw new Error(e2.message);
    return { estrelas: next };
  });