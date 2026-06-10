import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AnyClient = { from: (t: string) => any };

export type RotinaRow = {
  id: string;
  aluno_id: string;
  hora: string;
  titulo: string;
  descricao: string;
  emoji: string;
  status: "concluida" | "pendente" | "bloqueada";
  posicao: number;
  created_at: string;
};

export const listarRotina = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ alunoId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data: rows, error } = await sb
      .from("rotina_itens")
      .select("id, aluno_id, hora, titulo, descricao, emoji, status, posicao, created_at")
      .eq("aluno_id", data.alunoId)
      .order("posicao", { ascending: true })
      .order("hora", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as RotinaRow[];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  alunoId: z.string().uuid(),
  hora: z.string().min(1).max(20),
  titulo: z.string().min(1).max(120),
  descricao: z.string().max(500).default(""),
  emoji: z.string().max(8).default("⭐"),
  status: z.enum(["concluida", "pendente", "bloqueada"]).default("pendente"),
  posicao: z.number().int().min(0).max(1000).default(0),
});

export const upsertRotinaItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const payload = {
      ...(data.id ? { id: data.id } : {}),
      aluno_id: data.alunoId,
      hora: data.hora,
      titulo: data.titulo,
      descricao: data.descricao,
      emoji: data.emoji,
      status: data.status,
      posicao: data.posicao,
    };
    const { data: row, error } = await sb
      .from("rotina_itens")
      .upsert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as RotinaRow;
  });

export const concluirRotinaItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { error } = await sb
      .from("rotina_itens")
      .update({ status: "concluida" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const removerRotinaItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { error } = await sb.from("rotina_itens").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });