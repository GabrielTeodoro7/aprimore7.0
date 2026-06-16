/**
 * auth-store
 * --------------------------------------------------------------------------
 * Etapa A — auth real via Supabase. Mantém a MESMA API pública das telas
 * (useAuth, useUsers, useLogs, registrarLog, homeForRole) para não quebrar
 * o restante do app. As funções de session agora são async.
 *
 * useUsers / useLogs continuam em localStorage até a Etapa B (migração das
 * tabelas de domínio: turmas, atividades, etc.).
 */
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { listarUsuarios, atualizarUsuario, removerUsuario } from "@/lib/users.functions";
import { listarAuditLogs, registrarAuditLog } from "@/lib/audit.functions";

export type Role = "ceo" | "admin" | "professor" | "aluno";

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  role: Role;
  status: "ativo" | "inativo";
  criadoEm: string;
  ultimoAcesso?: string;
  escola?: string;
  professorId?: string;
  turma?: string;
  diagnostico?: Record<string, any>;
  config_a11y?: Record<string, any>;
  isDemo?: boolean;
  senha: string; // legado — não usado mais
};


export type AccessLog = {
  id: string;
  data: string;
  perfil: Role | "sistema";
  usuario: string;
  acao: string;
};

export const AUTH_QUERY_KEY = ["auth", "currentProfile"] as const;
export const USERS_QUERY_KEY = ["profiles", "list"] as const;
export const LOGS_QUERY_KEY = ["audit_logs", "list"] as const;

type ProfileRow = Awaited<ReturnType<typeof listarUsuarios>>[number];
type AuditRow = Awaited<ReturnType<typeof listarAuditLogs>>[number];

function mapProfile(p: ProfileRow): AuthUser {
  return {
    id: p.user_id,
    nome: p.nome,
    email: p.email,
    role: p.role as Role,
    status: (p.status as "ativo" | "inativo") ?? "ativo",
    criadoEm: p.created_at ?? new Date().toISOString(),
    ultimoAcesso: p.ultimo_acesso ?? undefined,
    escola: p.escola ?? undefined,
    professorId: p.professor_id ?? undefined,
    turma: p.turma ?? undefined,
    diagnostico: p.diagnostico as Record<string, any> ?? undefined,
    config_a11y: p.config_a11y as Record<string, any> ?? undefined,
    senha: "",
  };
}

function mapAudit(r: AuditRow): AccessLog {
  const payload = (r.payload ?? {}) as { perfil?: Role | "sistema"; usuario?: string };
  return {
    id: r.id,
    data: r.created_at,
    perfil: payload.perfil ?? "sistema",
    usuario: payload.usuario ?? "—",
    acao: r.acao,
  };
}

/** Dispara um audit log sem aguardar — falhas só são logadas. */
export function registrarLog(log: Omit<AccessLog, "id" | "data">) {
  void registrarAuditLog({
    data: {
      acao: log.acao,
      entidade: "sistema",
      payload: { perfil: log.perfil, usuario: log.usuario },
    },
  }).catch((e) => console.warn("[audit] falha registrando log:", e));
}

export function useLogs() {
  const { data } = useQuery({
    queryKey: LOGS_QUERY_KEY,
    queryFn: () => listarAuditLogs({ data: { limit: 200 } }),
    staleTime: 15_000,
  });
  return { list: (data ?? []).map(mapAudit) };
}

export function useUsers() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => listarUsuarios({ data: {} }),
    staleTime: 15_000,
  });
  const list = (data ?? []).map(mapProfile);

  const invalidate = () => qc.invalidateQueries({ queryKey: USERS_QUERY_KEY });

  const updateMut = useMutation({
    mutationFn: (vars: { profileId: string; patch: Partial<AuthUser> }) =>
      atualizarUsuario({
        data: {
          id: vars.profileId,
          nome: vars.patch.nome,
          status: vars.patch.status,
          escola: vars.patch.escola ?? null,
          turma: vars.patch.turma ?? null,
        },
      }),
    onSuccess: invalidate,
  });

  const removeMut = useMutation({
    mutationFn: (userId: string) => removerUsuario({ data: { userId } }),
    onSuccess: invalidate,
  });

  return {
    list,
    professores: list.filter((u) => u.role === "professor"),
    alunos: list.filter((u) => u.role === "aluno"),
    /**
     * Compat: criação real agora passa por `criarUsuarioReal`.
     * `add` apenas invalida cache (caller deve já ter chamado a server fn).
     */
    add: (_u: AuthUser) => {
      invalidate();
    },
    update: (userIdOrProfileId: string, patch: Partial<AuthUser>) => {
      const found = (data ?? []).find(
        (p) => p.user_id === userIdOrProfileId || p.id === userIdOrProfileId,
      );
      if (!found) return;
      updateMut.mutate({ profileId: found.id, patch });
    },
    remove: (userId: string) => {
      removeMut.mutate(userId);
    },
    byId: (id: string) => list.find((u) => u.id === id),
    updateStatus: (userId: string, status: "ativo" | "inativo") => {
      const found = (data ?? []).find(p => p.user_id === userId);
      if (found) updateMut.mutate({ profileId: found.id, patch: { status } });
    }
  };
}

/* ----------------------------- Supabase auth ----------------------------- */
function traduzir(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar";
  if (m.includes("user already registered")) return "Esse e-mail já está cadastrado";
  if (m.includes("password should be")) return "Senha muito curta (mínimo 6 caracteres)";
  return msg;
}

async function fetchCurrentProfile(): Promise<AuthUser | null> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return null;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", sess.session.user.id)
    .maybeSingle();
  if (error) {
    console.warn("[auth-store] erro lendo profile:", error.message);
    return null;
  }
  if (!profile) return null;
  return {
    id: profile.user_id,
    nome: profile.nome,
    email: profile.email,
    role: profile.role as Role,
    status: (profile.status as "ativo" | "inativo") ?? "ativo",
    criadoEm: profile.created_at ?? new Date().toISOString(),
    ultimoAcesso: profile.ultimo_acesso ?? undefined,
    escola: profile.escola ?? undefined,
    professorId: profile.professor_id ?? undefined,
    turma: profile.turma ?? undefined,
    diagnostico: profile.diagnostico as Record<string, any> ?? undefined,
    config_a11y: profile.config_a11y as Record<string, any> ?? undefined,
    isDemo: Boolean((profile as { is_demo?: boolean }).is_demo),
    senha: "",
  };
}


export function useAuth() {
  const qc = useQueryClient();
  const { data: user, isLoading, isFetching, isPending } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentProfile,
    staleTime: 30_000,
  });

  const refresh = useCallback(
    () => qc.invalidateQueries({ queryKey: AUTH_QUERY_KEY }),
    [qc],
  );

  return {
    user: user ?? null,
    realUser: user ?? null,
    loading: isPending || isLoading || isFetching,
    isImpersonating: false,

    /** Login com e-mail + senha (Supabase). */
    login: async (email: string, senha: string): Promise<AuthUser> => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error) throw new Error(traduzir(error.message));
      const profile = await fetchCurrentProfile();
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("Perfil não encontrado. Fale com o administrador.");
      }
      if (profile.status !== "ativo") {
        await supabase.auth.signOut();
        throw new Error("Conta inativa. Fale com o administrador.");
      }
      qc.setQueryData(AUTH_QUERY_KEY, profile);
      registrarLog({ perfil: profile.role, usuario: profile.email, acao: "Login" });
      return profile;
    },

    /** Cadastro (signup) público — cria conta como aluno por padrão. */
    signup: async (params: { nome: string; email: string; senha: string; role?: Role }): Promise<AuthUser> => {
      const role: Role = params.role ?? "aluno";
      const { error } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.senha,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          data: { nome: params.nome, role },
        },
      });
      if (error) throw new Error(traduzir(error.message));
      const profile = await fetchCurrentProfile();
      if (!profile) throw new Error("Conta criada. Confirme seu e-mail para entrar.");
      qc.setQueryData(AUTH_QUERY_KEY, profile);
      return profile;
    },

    /** Google via broker Lovable (obrigatório — não usar signInWithOAuth direto). */
    loginGoogle: async () => {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: typeof window !== "undefined" ? window.location.origin : undefined,
      });
      if (result.error) throw new Error(result.error.message);
      await refresh();
      return result;
    },

    /** Tenta entrar com contas demo (se existirem no backend). */
    loginAs: async (role: Role): Promise<AuthUser> => {
      const demo: Record<Role, { email: string; senha: string }> = {
        ceo: { email: "aprimoreeducation@gmail.com", senha: "Onda#CEO-2826!Aprimore" },
        admin: { email: "admin@escola.com", senha: "admin123" },
        professor: { email: "ana@escola.com", senha: "ana123" },
        aluno: { email: "joao@escola.com", senha: "joao123" },
      };
      const d = demo[role];
      const { error } = await supabase.auth.signInWithPassword({
        email: d.email,
        password: d.senha,
      });
      if (error) {
        throw new Error(
          `Conta demo "${d.email}" ainda não existe no backend. Cadastre-se (botão "Criar conta") ou peça ao admin para criar.`,
        );
      }
      const profile = await fetchCurrentProfile();
      if (!profile) throw new Error("Perfil demo não encontrado");
      qc.setQueryData(AUTH_QUERY_KEY, profile);
      return profile;
    },

    /** Envio de e-mail de recuperação. */
    resetPassword: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
      });
      if (error) throw new Error(traduzir(error.message));
    },

    logout: async () => {
      if (user) registrarLog({ perfil: user.role, usuario: user.email, acao: "Logout" });
      await supabase.auth.signOut();
      qc.setQueryData(AUTH_QUERY_KEY, null);
    },

    /** Impersonation real vem na Etapa B (precisa de server fn admin). */
    impersonate: (_alunoId: string) => {
      console.warn("[auth] impersonate ainda não implementado com backend real");
    },
    stopImpersonate: () => {
      console.warn("[auth] stopImpersonate ainda não implementado com backend real");
    },

    refresh,
  };
}

export function homeForRole(role: Role): string {
  if (role === "ceo") return "/ceo";
  if (role === "admin") return "/admin";
  if (role === "aluno") return "/aluno";
  return "/turma";
}
