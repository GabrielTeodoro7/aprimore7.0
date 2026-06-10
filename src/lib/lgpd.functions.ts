// ============================================================================
// Server functions LGPD — Onda B.3 (Direitos do Titular)
// ----------------------------------------------------------------------------
// RN.31 — Soft delete (via triggers no banco; aqui só wrappers)
// RN.34 — Exportação/Portabilidade (gera JSON do titular + grava em Storage)
// RN.46 — RIPD trimestral (agregação + grava em Storage)
// RN.63 — Registro de acesso a dados sensíveis com justificativa
// ----------------------------------------------------------------------------
// Equivalência Java: escola.service.ExportacaoLgpdService, RipdService.
// ============================================================================
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BUCKET = "lgpd-exports";
const VALIDADE_DIAS = 7;

// ---------------------------------------------------------------- RN.34 ----
// Solicita exportação dos próprios dados. Gera um JSON com as seções
// pertinentes e armazena em `{userId}/export-{timestamp}.json`. Retorna
// um signed URL com validade de 7 dias (equivalente arquitetural de S3+link assinado).
export const solicitarExportacaoDados = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const userId = context.userId as string;

    // 1) Coletar dados do titular (somente do próprio usuário; RLS protege)
    const [{ data: profile }, { data: aluno }, { data: termos }, { data: consents }] =
      await Promise.all([
        sb.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        sb.from("alunos").select("*").eq("profile_id",
          (await sb.from("profiles").select("id").eq("user_id", userId).maybeSingle()).data?.id
        ),
        sb.from("termos_aceitos").select("*"),
        sb.from("consentimentos").select("*"),
      ]);

    const pacote = {
      profile_id: profile?.id ?? null,
      gerado_em: new Date().toISOString(),
      validade_dias: VALIDADE_DIAS,
      dados: {
        profile,
        aluno,
        termos_aceitos: termos ?? [],
        consentimentos: consents ?? [],
      },
    };

    // 2) Persistir no Storage privado via service-role
    const path = `${userId}/export-${Date.now()}.json`;
    const body = new Blob([JSON.stringify(pacote, null, 2)], { type: "application/json" });
    const up = await supabaseAdmin.storage.from(BUCKET).upload(path, body, {
      contentType: "application/json",
      upsert: false,
    });
    if (up.error) throw new Error(up.error.message);

    // 3) Registrar pedido na tabela de auditoria
    const expira = new Date(Date.now() + VALIDADE_DIAS * 86400_000).toISOString();
    if (profile?.id) {
      await supabaseAdmin.from("lgpd_exportacoes").insert({
        profile_id: profile.id,
        status: "PRONTO",
        storage_path: path,
        expira_em: expira,
      });
    }

    // 4) Gerar signed URL de 7 dias
    const signed = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(path, VALIDADE_DIAS * 86400);
    if (signed.error) throw new Error(signed.error.message);

    return { url: signed.data.signedUrl, path, expiraEm: expira };
  });

// Lista as exportações do próprio usuário
export const listarMinhasExportacoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const { data: profile } = await sb
      .from("profiles").select("id").eq("user_id", context.userId).maybeSingle();
    if (!profile) return [];
    const { data } = await sb
      .from("lgpd_exportacoes")
      .select("id, status, storage_path, expira_em, created_at")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

// ---------------------------------------------------------------- RN.63 ----
// Registra acesso a um campo sensível (CPF, nota individual etc.) com
// justificativa textual obrigatória. Marca contexto_normal=false quando
// o acessante não tem relação direta (regra A6: professor->turma propria;
// admin->mesma escola; ceo->qualquer).
export const registrarAcessoSensivel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      alunoId: z.string().uuid(),
      campo: z.string().min(2).max(80),
      justificativa: z.string().min(10).max(500),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const { data: actor } = await sb
      .from("profiles").select("id, role, escola")
      .eq("user_id", context.userId).maybeSingle();
    if (!actor) throw new Error("Perfil não encontrado");

    // Heurística de "contexto normal": ceo sempre OK; admin se mesma escola
    let normal = actor.role === "ceo";
    if (!normal && actor.role === "admin") {
      const { data: a } = await sb.from("alunos")
        .select("id, profile_id, profiles!inner(escola)")
        .eq("id", data.alunoId).maybeSingle();
      normal = !!a && a.profiles?.escola === actor.escola;
    }

    const { error } = await supabaseAdmin.from("logs_acesso_sensiveis").insert({
      actor_id: actor.id,
      aluno_id: data.alunoId,
      campo: data.campo,
      justificativa: data.justificativa,
      contexto_normal: normal,
    });
    if (error) throw new Error(error.message);
    return { ok: true, contextoNormal: normal };
  });

// ---------------------------------------------------------------- RN.46 ----
// Gera relatório RIPD trimestral on-demand (DPO/CEO). Agrega contagens
// nas tabelas LGPD e grava JSON em ripd/{ano}-Q{trim}.json.
export const gerarRipd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const { data: actor } = await sb
      .from("profiles").select("role").eq("user_id", context.userId).maybeSingle();
    if (!actor || !["admin", "ceo"].includes(actor.role))
      throw new Error("Apenas DPO/Admin/CEO podem gerar RIPD");

    const now = new Date();
    const trimestre = Math.floor(now.getMonth() / 3) + 1;
    const ano = now.getFullYear();
    const inicioMes = (trimestre - 1) * 3;
    const inicio = new Date(ano, inicioMes, 1).toISOString();
    const fim = new Date(ano, inicioMes + 3, 1).toISOString();

    const [{ count: cExp }, { count: cAcc }, { count: cTermo }, { count: cCons }] =
      await Promise.all([
        supabaseAdmin.from("lgpd_exportacoes").select("*", { count: "exact", head: true })
          .gte("created_at", inicio).lt("created_at", fim),
        supabaseAdmin.from("logs_acesso_sensiveis").select("*", { count: "exact", head: true })
          .gte("created_at", inicio).lt("created_at", fim),
        supabaseAdmin.from("termos_aceitos").select("*", { count: "exact", head: true })
          .gte("aceito_em", inicio).lt("aceito_em", fim),
        supabaseAdmin.from("consentimentos").select("*", { count: "exact", head: true })
          .gte("updated_at", inicio).lt("updated_at", fim),
      ]);

    const resumo = {
      periodo: { ano, trimestre, inicio, fim },
      exportacoes_realizadas: cExp ?? 0,
      acessos_sensiveis: cAcc ?? 0,
      termos_aceitos: cTermo ?? 0,
      consentimentos_alterados: cCons ?? 0,
      gerado_em: now.toISOString(),
    };

    const path = `ripd/${ano}-Q${trimestre}-${Date.now()}.json`;
    const up = await supabaseAdmin.storage.from(BUCKET).upload(
      path, new Blob([JSON.stringify(resumo, null, 2)], { type: "application/json" }),
      { contentType: "application/json", upsert: false },
    );
    if (up.error) throw new Error(up.error.message);

    await supabaseAdmin.from("ripd_relatorios").insert({
      trimestre, ano, storage_path: path, resumo,
    });

    const signed = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 7 * 86400);
    return { resumo, url: signed.data?.signedUrl, path };
  });

export const listarRipds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const { data: actor } = await sb
      .from("profiles").select("role").eq("user_id", context.userId).maybeSingle();
    if (!actor || !["admin", "ceo"].includes(actor.role)) return [];
    const { data } = await sb
      .from("ripd_relatorios")
      .select("id, trimestre, ano, storage_path, resumo, gerado_em")
      .order("gerado_em", { ascending: false });
    return data ?? [];
  });

export const obterSignedUrlRipd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ path: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const { data: actor } = await sb
      .from("profiles").select("role").eq("user_id", context.userId).maybeSingle();
    if (!actor || !["admin", "ceo"].includes(actor.role))
      throw new Error("Acesso negado");
    const signed = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(data.path, 7 * 86400);
    if (signed.error) throw new Error(signed.error.message);
    return { url: signed.data.signedUrl };
  });
