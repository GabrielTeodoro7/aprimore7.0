// ============================================================================
// Server functions de Segurança — Onda C / Sub-fase C.1
// ----------------------------------------------------------------------------
// RN.01 / RN.62 — validação de complexidade + expiração de senha
// RN.02 — registro de tentativa + verificação de lock
// RN.04 — checagem de unicidade de CPF / e-mail em tempo real
// RN.07 — solicitação anti-enumeração de reset
// RN.35 — validação de domínio institucional
// RN.61 — registro de anomalia (rastreável)
// ----------------------------------------------------------------------------
// Equivalência Java: escola.service.SegurancaService + serviços auxiliares.
// Estas server functions APENAS chamam o banco via Supabase; o cliente
// front-end nunca acessa as tabelas diretamente.
// ============================================================================
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// --------------------------------------------------------------------------
// Política de senha global (RN.01 / RN.62)
// --------------------------------------------------------------------------
export const obterPoliticaSenha = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;
    const { data } = await supabaseAdmin
      .from("politica_senha")
      .select("*")
      .eq("escopo", "global")
      .eq("ativo", true)
      .maybeSingle();
    return (
      data ?? {
        escopo: "global",
        min_tamanho: 10,
        exige_maiuscula: true,
        exige_minuscula: true,
        exige_numero: true,
        exige_simbolo: true,
        historico_n: 5,
        expiracao_dias: 180,
        max_tentativas: 5,
        janela_lock_min: 15,
      }
    );
  },
);

// --------------------------------------------------------------------------
// Verificar se um e-mail está em lock ativo (RN.02)
// Resposta intencionalmente NEUTRA quando não está bloqueado, para não
// revelar existência de conta (RN.07).
// --------------------------------------------------------------------------
export const verificarBloqueio = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(255) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;
    const { data: lock } = await supabaseAdmin
      .from("bloqueios_conta")
      .select("expira_em, tentativas")
      .eq("email", data.email)
      .eq("liberado", false)
      .gt("expira_em", new Date().toISOString())
      .order("iniciou_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!lock) return { bloqueado: false as const };
    const ms = new Date(lock.expira_em).getTime() - Date.now();
    return {
      bloqueado: true as const,
      minutos_restantes: Math.max(1, Math.ceil(ms / 60000)),
    };
  });

// --------------------------------------------------------------------------
// Registrar tentativa de login (RN.02 / RN.61).
// Sempre devolve `{ ok: true }` para evitar fingerprinting.
// --------------------------------------------------------------------------
export const registrarTentativaLogin = createServerFn({ method: "POST" })
  .inputValidator((d: {
    email: string;
    sucesso: boolean;
    motivo?: string;
    ip?: string;
    user_agent?: string;
  }) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email().max(255),
        sucesso: z.boolean(),
        motivo: z.string().max(40).optional(),
        ip: z.string().max(64).optional(),
        user_agent: z.string().max(512).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;

    // 1) Resolver user_id sem expor existência ao cliente.
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", data.email)
      .maybeSingle();

    await supabaseAdmin.from("tentativas_login").insert({
      email: data.email,
      user_id: prof?.user_id ?? null,
      sucesso: data.sucesso,
      motivo: data.motivo ?? (data.sucesso ? "ok" : "senha_incorreta"),
      ip: data.ip ?? null,
      user_agent: data.user_agent ?? null,
    });

    if (!data.sucesso) {
      // 2) Aplicar bloqueio progressivo se falhas recentes ultrapassam o limite.
      const { data: pol } = await supabaseAdmin
        .from("politica_senha")
        .select("max_tentativas, janela_lock_min")
        .eq("escopo", "global")
        .maybeSingle();
      const maxTent = pol?.max_tentativas ?? 5;
      const janela = pol?.janela_lock_min ?? 15;
      const desde = new Date(Date.now() - janela * 60_000).toISOString();
      const { count } = await supabaseAdmin
        .from("tentativas_login")
        .select("*", { count: "exact", head: true })
        .eq("email", data.email)
        .eq("sucesso", false)
        .gte("created_at", desde);

      if ((count ?? 0) >= maxTent) {
        const lockMs = janela * 60_000;
        await supabaseAdmin.from("bloqueios_conta").insert({
          email: data.email,
          user_id: prof?.user_id ?? null,
          expira_em: new Date(Date.now() + lockMs).toISOString(),
          tentativas: count ?? maxTent,
          motivo: "tentativas_excessivas",
        });
      }
    } else if (prof?.user_id) {
      // 3) Sucesso: atualiza ultimo_login.
      await supabaseAdmin
        .from("profiles")
        .update({ ultimo_login: new Date().toISOString() })
        .eq("user_id", prof.user_id);
    }
    return { ok: true as const };
  });

// --------------------------------------------------------------------------
// Verificar unicidade de CPF / e-mail em tempo real (RN.04).
// --------------------------------------------------------------------------
export const verificarUnicidade = createServerFn({ method: "POST" })
  .inputValidator((d: { campo: "cpf" | "email"; valor: string }) =>
    z
      .object({
        campo: z.enum(["cpf", "email"]),
        valor: z.string().trim().min(3).max(255),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;
    if (data.campo === "email") {
      const { data: r } = await supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: false })
        .eq("email", data.valor.toLowerCase())
        .limit(1)
        .maybeSingle();
      return { disponivel: !r };
    }
    const { data: r } = await supabaseAdmin
      .from("alunos")
      .select("id", { count: "exact", head: false })
      .eq("cpf", data.valor.replace(/\D/g, ""))
      .limit(1)
      .maybeSingle();
    return { disponivel: !r };
  });

// --------------------------------------------------------------------------
// Validar domínio do e-mail (RN.35). Usa função SECURITY DEFINER do banco.
// --------------------------------------------------------------------------
export const validarDominioEmail = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(255) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;
    const { data: r } = await supabaseAdmin.rpc("dominio_email_permitido", {
      _email: data.email,
    });
    return { permitido: r === true };
  });

// --------------------------------------------------------------------------
// Solicitar recuperação anti-enumeração (RN.07).
// Sempre devolve a MESMA mensagem.
// --------------------------------------------------------------------------
export const solicitarRecuperacaoSenha = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(255) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;

    // Trabalho equivalente em ambos os caminhos para evitar timing-attack:
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", data.email)
      .maybeSingle();

    // Sempre registra a solicitação (anti-enumeração rastreável):
    await supabaseAdmin.from("tokens_recuperacao_senha").insert({
      user_id: prof?.user_id ?? null,
      email_alvo: data.email,
      token_hash: cryptoRandomHex(64),
      expira_em: new Date(Date.now() + 30 * 60_000).toISOString(),
    });

    // O envio real do e-mail é delegado ao Supabase Auth via fluxo
    // padrão `resetPasswordForEmail` no cliente. Aqui só auditamos.
    return { ok: true as const, mensagem: "Se o e-mail estiver cadastrado, enviaremos instruções." };
  });

// --------------------------------------------------------------------------
// Registrar anomalia de acesso (RN.61) — invocado pós-login pelo cliente.
// --------------------------------------------------------------------------
export const registrarAnomaliaAcesso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    tipo: "novo_dispositivo" | "novo_pais" | "horario_atipico" | "velocidade_impossivel";
    gravidade?: "baixa" | "media" | "alta";
    ip?: string;
    user_agent?: string;
    pais?: string;
    cidade?: string;
    detalhes?: Record<string, unknown>;
  }) =>
    z
      .object({
        tipo: z.enum([
          "novo_dispositivo",
          "novo_pais",
          "horario_atipico",
          "velocidade_impossivel",
        ]),
        gravidade: z.enum(["baixa", "media", "alta"]).optional(),
        ip: z.string().max(64).optional(),
        user_agent: z.string().max(512).optional(),
        pais: z.string().max(64).optional(),
        cidade: z.string().max(120).optional(),
        detalhes: z.record(z.unknown()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    await sb.from("anomalias_acesso").insert({
      user_id: context.userId,
      tipo: data.tipo,
      gravidade: data.gravidade ?? "media",
      ip: data.ip ?? null,
      user_agent: data.user_agent ?? null,
      pais: data.pais ?? null,
      cidade: data.cidade ?? null,
      detalhes: data.detalhes ?? {},
    });
    return { ok: true as const };
  });

// --------------------------------------------------------------------------
// Helper interno: hex aleatório em tempo de execução servidor.
// --------------------------------------------------------------------------
function cryptoRandomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}
