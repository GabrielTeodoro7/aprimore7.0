import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      limit: z.number().int().min(1).max(500).default(100),
      entidade: z.string().max(60).optional(),
    }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("audit_logs")
      .select("id, actor_id, acao, entidade, entidade_id, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.entidade) q = q.eq("entidade", data.entidade);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const logSchema = z.object({
  acao: z.string().min(1).max(120),
  entidade: z.string().min(1).max(60).default("sistema"),
  entidadeId: z.string().uuid().optional().nullable(),
  payload: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const registrarAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => logSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    const { error } = await supabase.from("audit_logs").insert({
      actor_id: prof?.id ?? null,
      acao: data.acao,
      entidade: data.entidade,
      entidade_id: data.entidadeId ?? null,
      payload: (data.payload ?? null) as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });