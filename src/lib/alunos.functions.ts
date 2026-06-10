import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isValidCpf, onlyDigits } from "@/lib/cpf";

export const listarAlunos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("alunos")
      .select(
        "id, nome, idade, turma_id, profile_id, media, freq, tag, tone, responsavel, email, telefone, observacoes, necessidade, cpf, created_at",
      )
      .order("nome");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const cpfField = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? onlyDigits(v) : undefined))
  .refine((v) => v === undefined || isValidCpf(v), { message: "CPF inválido" });

const criarSchema = z.object({
  nome: z.string().min(1).max(120),
  turma_id: z.string().uuid(),
  idade: z.number().int().min(0).max(120).optional(),
  responsavel: z.string().max(120).optional(),
  email: z.string().email().optional(),
  telefone: z.string().max(40).optional(),
  observacoes: z.string().max(2000).optional(),
  necessidade: z.string().max(200).optional(),
  tag: z.string().max(40).optional(),
  tone: z.string().max(20).optional(),
  profile_id: z.string().uuid().optional(),
  cpf: cpfField,
});

export const criarAluno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => criarSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("alunos")
      .insert({
        nome: data.nome,
        turma_id: data.turma_id,
        idade: data.idade ?? null,
        responsavel: data.responsavel ?? null,
        email: data.email ?? null,
        telefone: data.telefone ?? null,
        observacoes: data.observacoes ?? null,
        necessidade: data.necessidade ?? null,
        tag: data.tag ?? "Regular",
        tone: data.tone ?? "blue",
        profile_id: data.profile_id ?? null,
        cpf: data.cpf ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const updateSchema = criarSchema.partial().extend({ id: z.string().uuid() });

export const atualizarAluno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => updateSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { data: row, error } = await context.supabase
      .from("alunos")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const removerAluno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("alunos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
