import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Tabela `avaliacoes` ainda não está nos tipos gerados — cast pontual até regenerar.
type AnyClient = { from: (t: string) => any };

export const listarAvaliacoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ turmaId: z.string().uuid().optional() }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    let q = sb
      .from("avaliacoes")
      .select(
        "id, turma_id, professor_id, materia, titulo, data, media, alunos, tone, peso, observacoes, created_at",
      )
      .order("created_at", { ascending: false });
    if (data.turmaId) q = q.eq("turma_id", data.turmaId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as Array<{
      id: string;
      turma_id: string;
      professor_id: string;
      materia: string;
      titulo: string;
      data: string | null;
      media: number | null;
      alunos: number;
      tone: string;
      peso: number;
      observacoes: string | null;
      created_at: string;
    }>;
  });

const criarSchema = z.object({
  turmaId: z.string().uuid(),
  titulo: z.string().min(1).max(200),
  materia: z.string().max(60).default(""),
  data: z.string().optional().nullable(),
  media: z.number().min(0).max(10).optional().nullable(),
  alunos: z.number().int().min(0).max(1000).default(0),
  tone: z.string().max(20).default("blue"),
  peso: z.number().int().min(1).max(10).default(1),
  observacoes: z.string().max(2000).optional().nullable(),
});

export const criarAvaliacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => criarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sb = supabase as unknown as AnyClient;
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!prof) throw new Error("Perfil não encontrado");
    const { data: row, error } = await sb
      .from("avaliacoes")
      .insert({
        turma_id: data.turmaId,
        professor_id: prof.id,
        titulo: data.titulo,
        materia: data.materia,
        data: data.data ?? null,
        media: data.media ?? null,
        alunos: data.alunos,
        tone: data.tone,
        peso: data.peso,
        observacoes: data.observacoes ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const removerAvaliacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { error } = await sb.from("avaliacoes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });