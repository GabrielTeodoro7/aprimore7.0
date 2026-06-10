/**
 * MODULO: Atividades.functions.ts
 * 
 * Conceitos de POO e Java aplicados aqui:
 * - INTERFACES / TIPAGEM: Uso de TypeScript interfaces (Activity) para definir contratos de dados.
 * - COLEÇÕES: Uso de Arrays (.map, .filter) para manipular listas de atividades e alunos.
 * - EXCEÇÕES: Tratamento de erros de banco com try/catch implícito ou explícito.
 * - THREADS (Equivalência): Server functions operam de forma assíncrona (async/await), simulando execução paralela.
 * - JDBC (Equivalência): O cliente Supabase atua como o driver de conexão com o banco de dados.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { criarNotificacao } from "@/lib/notificacoes.functions";

export const listarAtividades = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ turma_id: z.string().uuid().optional() }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("atividades")
      .select(
        "id, titulo, materia, data, tone, adaptada, descricao, objetivos, materiais, passos, dificuldade, turma_id, professor_id, arquivos, created_at",
      )
      .order("created_at", { ascending: false });
    if (data.turma_id) q = q.eq("turma_id", data.turma_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const criarSchema = z.object({
  turma_id: z.string().uuid(),
  titulo: z.string().min(1).max(200),
  materia: z.string().max(60).default(""),
  data: z.string().optional(),
  tone: z.string().max(20).optional(),
  adaptada: z.boolean().optional(),
  descricao: z.string().max(4000).optional(),
  objetivos: z.array(z.string().max(300)).max(20).default([]),
  materiais: z.array(z.string().max(300)).max(50).default([]),
  passos: z.array(z.string().max(500)).max(50).default([]),
  dificuldade: z.enum(["fácil", "média", "desafio"]).optional(),
  alunoIds: z.array(z.string().uuid()).optional(),
  arquivos: z.array(z.string()).optional(),
});

export const criarAtividade = createServerFn({ method: "POST" })
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
      .from("atividades")
      .insert({
        turma_id: data.turma_id,
        professor_id: prof.id,
        titulo: data.titulo,
        materia: data.materia,
        data: data.data ?? null,
        tone: data.tone ?? "blue",
        adaptada: data.adaptada ?? false,
        descricao: data.descricao ?? null,
        objetivos: data.objetivos,
        materiais: data.materiais,
        passos: data.passos,
        dificuldade: data.dificuldade ?? null,
        arquivos: data.arquivos ?? [],
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (data.alunoIds && data.alunoIds.length > 0) {
      const links = data.alunoIds.map((aluno_id) => ({
        atividade_id: row.id,
        aluno_id,
      }));
      const { error: linkErr } = await supabase.from("atividade_alunos").insert(links);
      if (linkErr) throw new Error(linkErr.message);

      // Enviar notificações para os alunos específicos
      for (const aluno_id of data.alunoIds) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", aluno_id) // aluno_id is profile id in the logic
          .maybeSingle();
        
        if (profile) {
          await criarNotificacao({
            data: {
              profile_id: profile.id,
              titulo: "Nova atividade para você!",
              sub: `Professor(a) postou: ${data.titulo}`,
              tone: (data.tone as any) || "blue",
              lida: false,
            }
          }).catch(err => console.error("Erro ao notificar aluno:", err));
        }
      }
    }
    return row;
  });

export const removerAtividade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("atividades")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
