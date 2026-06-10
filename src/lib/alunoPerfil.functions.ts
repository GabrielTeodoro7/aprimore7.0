/**
 * MODULO: AlunoPerfil.functions.ts
 * 
 * Aplicando POO (Programação Orientada a Objetos):
 * - CLASSES E OBJETOS: O objeto 'context' encapsula a sessão e o cliente Supabase.
 * - CONSTRUTORES: createServerFn inicializa o comportamento do endpoint.
 * - ENCAPSULAMENTO: A lógica de validação do input está encapsulada no esquema Zod.
 * - EXCEÇÕES: Lançamos erros explícitos que são capturados pelo middleware.
 */
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
      .select("id, nome, turma_id, estrelas, streak, last_streak_at")
      .eq("profile_id", prof.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!aluno) return null;

    // Lógica de Streak
    const now = new Date();
    const last = aluno.last_streak_at ? new Date(aluno.last_streak_at) : null;
    let currentStreak = aluno.streak ?? 0;
    let shouldUpdate = false;

    if (!last) {
      currentStreak = 1;
      shouldUpdate = true;
    } else {
      const diffMs = now.getTime() - last.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      const isSameDay = now.toDateString() === last.toDateString();

      if (!isSameDay) {
        if (diffDays < 2) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      await sb.from("alunos").update({ 
        streak: currentStreak, 
        last_streak_at: now.toISOString() 
      }).eq("id", aluno.id);
    }

    return {
      id: aluno.id as string,
      nome: (aluno.nome ?? prof.nome) as string,
      turmaId: aluno.turma_id as string,
      profileId: prof.id as string,
      estrelas: (aluno.estrelas ?? 0) as number,
      streak: currentStreak,
      lastStreakAt: now.toISOString(),
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