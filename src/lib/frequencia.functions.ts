import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarFrequencia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      turmaId: z.string().uuid().optional(),
      alunoId: z.string().uuid().optional(),
      data: z.string().optional(),
    }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("frequencia")
      .select("id, turma_id, aluno_id, data, presente, justificativa")
      .order("data", { ascending: false });
    if (data.turmaId) q = q.eq("turma_id", data.turmaId);
    if (data.alunoId) q = q.eq("aluno_id", data.alunoId);
    if (data.data) q = q.eq("data", data.data);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const lancarSchema = z.object({
  turmaId: z.string().uuid(),
  data: z.string().min(8),
  registros: z
    .array(
      z.object({
        alunoId: z.string().uuid(),
        presente: z.boolean(),
        justificativa: z.string().max(500).optional().nullable(),
      }),
    )
    .min(1)
    .max(200),
});

export const lancarFrequencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => lancarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const payload = data.registros.map((r) => ({
      turma_id: data.turmaId,
      aluno_id: r.alunoId,
      data: data.data,
      presente: r.presente,
      justificativa: r.justificativa ?? null,
    }));
    const { data: rows, error } = await context.supabase
      .from("frequencia")
      .upsert(payload, { onConflict: "aluno_id,data" })
      .select();
    if (error) throw new Error(error.message);
    return rows ?? [];
  });