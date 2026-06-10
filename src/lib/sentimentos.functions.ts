import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarSentimentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ alunoId: z.string().uuid().optional(), limit: z.number().int().min(1).max(200).default(60) }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("sentimentos")
      .select("id, aluno_id, emocao, emoji, intensidade, nota, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.alunoId) q = q.eq("aluno_id", data.alunoId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const registrarSchema = z.object({
  alunoId: z.string().uuid(),
  emocao: z.string().min(1).max(60),
  emoji: z.string().max(8).optional().nullable(),
  intensidade: z.number().int().min(1).max(5).optional().nullable(),
  nota: z.string().max(500).optional().nullable(),
});

export const registrarSentimento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => registrarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("sentimentos")
      .insert({
        aluno_id: data.alunoId,
        emocao: data.emocao,
        emoji: data.emoji ?? null,
        intensidade: data.intensidade ?? null,
        nota: data.nota ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });