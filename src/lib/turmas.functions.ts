import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarTurmas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("turmas")
      .select("id, nome, ano, professor_id, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const criarSchema = z.object({
  nome: z.string().min(1).max(120),
  ano: z.string().max(20).optional(),
});

export const criarTurma = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => criarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", userId)
      .maybeSingle();
    if (!prof) throw new Error("Perfil não encontrado");
    if (prof.role !== "admin" && prof.role !== "professor") {
      throw new Error("Sem permissão");
    }
    const { data: row, error } = await supabase
      .from("turmas")
      .insert({ nome: data.nome, ano: data.ano ?? null, professor_id: prof.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1).max(120).optional(),
  ano: z.string().max(20).optional(),
});

export const atualizarTurma = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => updateSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { data: row, error } = await context.supabase
      .from("turmas")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const removerTurma = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("turmas").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
