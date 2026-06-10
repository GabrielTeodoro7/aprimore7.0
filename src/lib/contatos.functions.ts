import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarContatosExternos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!prof) throw new Error("Perfil não encontrado");

    const { data, error } = await supabase
      .from("contatos_externos")
      .select("id, nome, whatsapp, parentesco, aluno_id, professor_id")
      .eq("professor_id", prof.id)
      .order("nome", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

const contatoSchema = z.object({
  nome: z.string().min(1).max(120),
  whatsapp: z.string().min(8).max(20),
  parentesco: z.string().optional(),
  alunoId: z.string().uuid().optional(),
});

export const criarContatoExterno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => contatoSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!prof) throw new Error("Perfil não encontrado");

    const { data: row, error } = await supabase
      .from("contatos_externos")
      .insert({
        professor_id: prof.id,
        aluno_id: data.alunoId ?? null,
        nome: data.nome,
        whatsapp: data.whatsapp,
        parentesco: data.parentesco ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

export const removerContatoExterno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contatos_externos")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
