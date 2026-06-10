import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AnyClient = { from: (t: string) => any };

export type NotifRow = {
  id: string;
  profile_id: string;
  title: string;
  sub: string;
  tone: string;
  read: boolean;
  created_at: string;
};

async function meuProfileId(ctx: { supabase: any; userId: string }): Promise<string | null> {
  const { data } = await ctx.supabase
    .from("profiles")
    .select("id")
    .eq("user_id", ctx.userId)
    .maybeSingle();
  return data?.id ?? null;
}

export const listarNotificacoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const pid = await meuProfileId(context as any);
    if (!pid) return [] as NotifRow[];
    const { data, error } = await sb
      .from("notificacoes")
      .select("id, profile_id, title, sub, tone, read, created_at")
      .eq("profile_id", pid)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as NotifRow[];
  });

const criarSchema = z.object({
  title: z.string().min(1).max(160),
  sub: z.string().max(300).default(""),
  tone: z.string().max(20).default("blue"),
  profileId: z.string().uuid().optional(),
});

export const criarNotificacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => criarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const pid = data.profileId ?? (await meuProfileId(context as any));
    if (!pid) throw new Error("Perfil não encontrado");
    const { data: row, error } = await sb
      .from("notificacoes")
      .insert({ profile_id: pid, title: data.title, sub: data.sub, tone: data.tone })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as NotifRow;
  });

export const marcarNotifLida = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { error } = await sb.from("notificacoes").update({ read: true }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const marcarTodasLidas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const pid = await meuProfileId(context as any);
    if (!pid) return { ok: true as const };
    const { error } = await sb
      .from("notificacoes")
      .update({ read: true })
      .eq("profile_id", pid)
      .eq("read", false);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });