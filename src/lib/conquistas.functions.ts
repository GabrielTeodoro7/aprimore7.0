import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarConquistas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ alunoId: z.string().uuid().optional() }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("conquistas")
      .select("id, aluno_id, tipo, titulo, descricao, emoji, created_at")
      .order("created_at", { ascending: false });
    if (data.alunoId) q = q.eq("aluno_id", data.alunoId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const criarSchema = z.object({
  alunoId: z.string().uuid(),
  tipo: z.string().min(1).max(60),
  titulo: z.string().min(1).max(160),
  descricao: z.string().max(800).optional().nullable(),
  emoji: z.string().max(8).optional().nullable(),
});

export const concederConquista = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => criarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("conquistas")
      .insert({
        aluno_id: data.alunoId,
        tipo: data.tipo,
        titulo: data.titulo,
        descricao: data.descricao ?? null,
        emoji: data.emoji ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const removerConquista = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("conquistas").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });