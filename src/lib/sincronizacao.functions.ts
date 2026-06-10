import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * RN.53 — Enfileirar operação offline para sincronização posterior.
 */
export const enfileirarOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    entidade: string;
    operacao: "INSERT" | "UPDATE" | "DELETE";
    payload: Record<string, unknown>;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data: row, error } = await supabase
      .from("fila_sincronizacao")
      .insert({
        user_id: userId,
        entidade: data.entidade,
        operacao: data.operacao,
        payload: data.payload,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

/**
 * RN.53 — Listar pendências de sincronização do usuário autenticado.
 */
export const listarPendencias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data, error } = await supabase
      .from("fila_sincronizacao")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "PENDENTE")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });
