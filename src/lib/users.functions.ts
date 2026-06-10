import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarUsuarios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ role: z.enum(["admin", "professor", "aluno"]).optional() }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("profiles")
      .select(
        "id, user_id, nome, email, role, escola, professor_id, turma, status, ultimo_acesso, created_at",
      )
      .order("created_at", { ascending: false });
    if (data.role) q = q.eq("role", data.role);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const updatePerfilSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1).max(120).optional(),
  status: z.enum(["ativo", "inativo"]).optional(),
  escola: z.string().max(120).nullable().optional(),
  turma: z.string().max(60).nullable().optional(),
});

export const atualizarUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => updatePerfilSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { data: row, error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const removerUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ userId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: caller } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", userId)
      .maybeSingle();
    if (!caller || caller.role !== "admin") {
      return { ok: false as const, error: "Apenas admin pode remover usuários" };
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) return { ok: false as const, error: error.message };
    await supabase.from("audit_logs").insert({
      actor_id: caller.id,
      acao: "remover_usuario",
      entidade: "profiles",
      entidade_id: data.userId,
      payload: null,
    });
    return { ok: true as const };
  });

const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(6).max(72),
  nome: z.string().min(1).max(120),
  role: z.enum(["admin", "professor", "aluno"]),
  escola: z.string().max(120).optional(),
  turma: z.string().max(60).optional(),
  professorId: z.string().uuid().optional(),
});

/**
 * Cria um usuário real no Supabase Auth.
 * - Apenas admin pode criar admin/professor.
 * - Admin OU professor pode criar aluno (professor só vincula a si mesmo).
 * Trigger `handle_new_user` cria profile + user_role a partir do metadata.
 */
export const criarUsuarioReal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Carrega papel e profile.id do caller
    const { data: caller } = await supabase
      .from("profiles")
      .select("id, role, is_demo")
      .eq("user_id", userId)
      .maybeSingle();

    if (!caller) {
      return { ok: false as const, error: "Perfil do solicitante não encontrado" };
    }

    if (caller.is_demo) {
      return { ok: false as const, error: "Modo demonstração: criação de contas desativada." };
    }


    const isAdmin = caller.role === "admin";
    const isProfessor = caller.role === "professor";

    // Regras de autorização
    if (data.role === "admin" && !isAdmin) {
      return { ok: false as const, error: "Apenas admin pode criar admin" };
    }
    if (data.role === "professor" && !isAdmin) {
      return { ok: false as const, error: "Apenas admin pode criar professor" };
    }
    if (data.role === "aluno" && !isAdmin && !isProfessor) {
      return { ok: false as const, error: "Sem permissão para criar aluno" };
    }

    // Professor só pode vincular alunos a si próprio
    const professorId =
      isProfessor && data.role === "aluno" ? caller.id : data.professorId ?? null;

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.senha,
      email_confirm: true,
      user_metadata: {
        nome: data.nome,
        role: data.role,
        escola: data.escola ?? null,
        turma: data.turma ?? null,
        professor_id: professorId,
      },
    });

    if (error || !created.user) {
      return { ok: false as const, error: error?.message ?? "Falha ao criar usuário" };
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: caller.id,
      acao: "criar_usuario",
      entidade: "profiles",
      entidade_id: created.user.id,
      payload: { email: data.email, role: data.role },
    });

    return { ok: true as const, userId: created.user.id };
  });
