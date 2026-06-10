import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarMensagens = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      turmaId: z.string().uuid().optional(),
      comProfileId: z.string().uuid().optional(),
    }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("mensagens")
      .select("id, remetente_id, destinatario_id, turma_id, texto, lida, created_at")
      .order("created_at", { ascending: true });
    if (data.turmaId) q = q.eq("turma_id", data.turmaId);
    if (data.comProfileId) {
      q = q.or(`destinatario_id.eq.${data.comProfileId},remetente_id.eq.${data.comProfileId}`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const enviarSchema = z
  .object({
    texto: z.string().min(1).max(2000),
    destinatarioId: z.string().uuid().optional(),
    turmaId: z.string().uuid().optional(),
  })
  .refine((v) => v.destinatarioId || v.turmaId, {
    message: "Informe destinatário ou turma",
  });

export const enviarMensagem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => enviarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!prof) throw new Error("Perfil não encontrado");
    const { data: row, error } = await supabase
      .from("mensagens")
      .insert({
        remetente_id: prof.id,
        destinatario_id: data.destinatarioId ?? null,
        turma_id: data.turmaId ?? null,
        texto: data.texto,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const marcarLida = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("mensagens")
      .update({ lida: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });