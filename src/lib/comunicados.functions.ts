import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarComunicados = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ turmaId: z.string().uuid().optional() }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("comunicados")
      .select("id, professor_id, turma_id, titulo, corpo, created_at")
      .order("created_at", { ascending: false });
    if (data.turmaId) q = q.eq("turma_id", data.turmaId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const criarSchema = z.object({
  turmaId: z.string().uuid(),
  titulo: z.string().min(1).max(180),
  corpo: z.string().min(1).max(4000),
});

export const criarComunicado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => criarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!prof) throw new Error("Perfil não encontrado");
    const { data: row, error } = await supabase
      .from("comunicados")
      .insert({
        professor_id: prof.id,
        turma_id: data.turmaId,
        titulo: data.titulo,
        corpo: data.corpo,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const removerComunicado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("comunicados").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });