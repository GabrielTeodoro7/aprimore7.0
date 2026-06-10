import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarSubmissoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ atividadeId: z.string().uuid().optional(), alunoId: z.string().uuid().optional() }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("submissoes")
      .select("id, atividade_id, aluno_id, status, nota, feedback, entregue_em, created_at")
      .order("created_at", { ascending: false });
    if (data.atividadeId) q = q.eq("atividade_id", data.atividadeId);
    if (data.alunoId) q = q.eq("aluno_id", data.alunoId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const entregarSchema = z.object({
  atividadeId: z.string().uuid(),
  alunoId: z.string().uuid(),
  status: z.enum(["pendente", "entregue", "atrasada"]).default("entregue"),
});

export const entregarSubmissao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => entregarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("submissoes")
      .upsert(
        {
          atividade_id: data.atividadeId,
          aluno_id: data.alunoId,
          status: data.status,
          entregue_em: new Date().toISOString(),
        },
        { onConflict: "atividade_id,aluno_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const avaliarSchema = z.object({
  id: z.string().uuid(),
  nota: z.number().min(0).max(10).nullable().optional(),
  feedback: z.string().max(2000).nullable().optional(),
});

export const avaliarSubmissao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => avaliarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { data: row, error } = await context.supabase
      .from("submissoes")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });