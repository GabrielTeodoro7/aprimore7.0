import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AnyClient = { from: (t: string) => any };

export const getMeuPerfil = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data, error } = await sb
      .from("profiles")
      .select(
        "id, user_id, nome, email, role, cargo, turma, ano, theme, escola, status, created_at",
      )
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as null | {
      id: string;
      user_id: string;
      nome: string;
      email: string;
      role: string;
      cargo: string | null;
      turma: string | null;
      ano: string | null;
      theme: string;
      escola: string | null;
      status: string;
      created_at: string;
    };
  });

const updateSchema = z.object({
  nome: z.string().min(1).max(120).optional(),
  cargo: z.string().max(60).optional().nullable(),
  turma: z.string().max(60).optional().nullable(),
  ano: z.string().max(20).optional().nullable(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const atualizarMeuPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => updateSchema.parse(i))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) patch[k] = v;
    }
    const { data: row, error } = await sb
      .from("profiles")
      .update(patch)
      .eq("user_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });