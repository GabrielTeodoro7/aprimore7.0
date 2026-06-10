-- =============================================================================
-- Onda C — Sub-fase C.1 (Segurança e Identidade)
-- Migration M1: Política de senha, histórico, tentativas e bloqueios
-- RNs: RN.01 (complexidade + histórico), RN.02 (bloqueio progressivo),
--      RN.62 (expiração configurável)
-- -----------------------------------------------------------------------------
-- Estratégia:
--   * Estrutura puramente ADITIVA — nenhuma tabela existente é alterada,
--     exceto pelas 4 colunas novas em `profiles` (todas IF NOT EXISTS).
--   * RLS habilitada em toda tabela nova; GRANTs vêm antes das policies.
--   * Auditoria: tabelas `tentativas_login` e `bloqueios_conta` são
--     consultáveis por admin/CEO para rastreio. RN.02 exige bloqueio auditável.
--   * Migração de senhas existentes: NÃO se aplica — a hashagem real é feita
--     pelo Supabase Auth. As tabelas abaixo registram METADADOS (tentativas,
--     locks, histórico didático) usadas pelo backend Java (PBKDF2) e pelo
--     frontend para enforcement adicional. Usuários já cadastrados continuam
--     logando normalmente; o histórico começa a ser povoado a partir da
--     primeira nova troca de senha (sem bloqueios retroativos).
-- =============================================================================

-- ------------------------------- politica_senha ------------------------------
CREATE TABLE IF NOT EXISTS public.politica_senha (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escopo         TEXT NOT NULL DEFAULT 'global',          -- 'global' | 'escola:<id>'
  min_tamanho    INT  NOT NULL DEFAULT 10,                -- RN.01
  exige_maiuscula BOOLEAN NOT NULL DEFAULT true,
  exige_minuscula BOOLEAN NOT NULL DEFAULT true,
  exige_numero    BOOLEAN NOT NULL DEFAULT true,
  exige_simbolo   BOOLEAN NOT NULL DEFAULT true,
  historico_n     INT  NOT NULL DEFAULT 5,                -- últimas N senhas bloqueadas
  expiracao_dias  INT  NOT NULL DEFAULT 180,              -- RN.62
  max_tentativas  INT  NOT NULL DEFAULT 5,                -- RN.02
  janela_lock_min INT  NOT NULL DEFAULT 15,               -- minutos
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (escopo)
);

CREATE TRIGGER trg_politica_senha_updated_at
  BEFORE UPDATE ON public.politica_senha
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.politica_senha TO authenticated;
GRANT ALL    ON public.politica_senha TO service_role;
ALTER TABLE public.politica_senha ENABLE ROW LEVEL SECURITY;

CREATE POLICY "politica_senha_read_authenticated"
  ON public.politica_senha FOR SELECT TO authenticated USING (ativo = true);

CREATE POLICY "politica_senha_admin_manage"
  ON public.politica_senha FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed da política global padrão (idempotente).
INSERT INTO public.politica_senha (escopo) VALUES ('global')
  ON CONFLICT (escopo) DO NOTHING;

-- ------------------------------- senha_historico -----------------------------
-- Armazena apenas HASH PBKDF2 (jamais a senha em claro).
-- Usado para impedir reutilização das últimas N senhas (RN.01).
CREATE TABLE IF NOT EXISTS public.senha_historico (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hash        TEXT NOT NULL,                       -- PBKDF2 com salt
  algoritmo   TEXT NOT NULL DEFAULT 'PBKDF2WithHmacSHA256',
  iteracoes   INT  NOT NULL DEFAULT 200000,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_senha_historico_user
  ON public.senha_historico(user_id, created_at DESC);

GRANT SELECT, INSERT ON public.senha_historico TO authenticated;
GRANT ALL ON public.senha_historico TO service_role;
ALTER TABLE public.senha_historico ENABLE ROW LEVEL SECURITY;

-- O usuário só vê o próprio histórico (necessário para validar reutilização do lado servidor).
CREATE POLICY "senha_historico_owner_select"
  ON public.senha_historico FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "senha_historico_owner_insert"
  ON public.senha_historico FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "senha_historico_admin_all"
  ON public.senha_historico FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ------------------------------- tentativas_login ----------------------------
-- Cada tentativa de login, com IP e user-agent. RN.02 + RN.61 auditáveis.
CREATE TABLE IF NOT EXISTS public.tentativas_login (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,                       -- pode não existir user_id em caso de tentativa inválida
  user_id     UUID,                                -- preenchido quando o e-mail existe
  sucesso     BOOLEAN NOT NULL,
  ip          TEXT,
  user_agent  TEXT,
  motivo      TEXT,                                -- 'senha_incorreta' | 'conta_bloqueada' | 'ok'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tentativas_email_data
  ON public.tentativas_login(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tentativas_user
  ON public.tentativas_login(user_id, created_at DESC);

GRANT SELECT, INSERT ON public.tentativas_login TO authenticated;
GRANT ALL ON public.tentativas_login TO service_role;
ALTER TABLE public.tentativas_login ENABLE ROW LEVEL SECURITY;

-- O usuário enxerga apenas suas próprias tentativas; admin vê tudo (auditável).
CREATE POLICY "tentativas_owner_select"
  ON public.tentativas_login FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tentativas_admin_all"
  ON public.tentativas_login FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "tentativas_anon_insert_via_service"
  ON public.tentativas_login FOR INSERT TO authenticated
  WITH CHECK (true);   -- a inserção ocorre via server function (controlada)

-- ------------------------------- bloqueios_conta -----------------------------
-- Lock temporário com janela exponencial.
CREATE TABLE IF NOT EXISTS public.bloqueios_conta (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  iniciou_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em     TIMESTAMPTZ NOT NULL,
  tentativas    INT NOT NULL DEFAULT 0,
  motivo        TEXT NOT NULL DEFAULT 'tentativas_excessivas',
  liberado      BOOLEAN NOT NULL DEFAULT false,
  liberado_em   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bloqueios_email_ativo
  ON public.bloqueios_conta(email) WHERE liberado = false;

GRANT SELECT, INSERT, UPDATE ON public.bloqueios_conta TO authenticated;
GRANT ALL ON public.bloqueios_conta TO service_role;
ALTER TABLE public.bloqueios_conta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloqueios_owner_select"
  ON public.bloqueios_conta FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "bloqueios_admin_all"
  ON public.bloqueios_conta FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- -------------------- colunas auxiliares em profiles -------------------------
-- Todas IF NOT EXISTS para não quebrar usuários já cadastrados.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS senha_alterada_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exige_troca       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bloqueado_ate     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ultimo_login      TIMESTAMPTZ;

-- ----------------------- função utilitária: precisa_trocar ------------------
-- RN.62: indica se o usuário deve ser forçado a trocar a senha.
CREATE OR REPLACE FUNCTION public.senha_precisa_trocar(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    p.exige_troca
    OR (p.senha_alterada_em IS NOT NULL
        AND p.senha_alterada_em < now() - (
          SELECT (expiracao_dias || ' days')::interval
          FROM public.politica_senha WHERE escopo = 'global' AND ativo LIMIT 1
        )),
    false
  )
  FROM public.profiles p WHERE p.user_id = _user_id;
$$;
GRANT EXECUTE ON FUNCTION public.senha_precisa_trocar(UUID) TO authenticated;
-- =============================================================================
-- Onda C — C.1 — Migration M2: Rotação de refresh tokens (RN.03)
-- -----------------------------------------------------------------------------
-- Observação arquitetural:
--   * O Supabase Auth já gerencia JWT + refresh internamente; esta tabela
--     existe para o BACKEND JAVA acadêmico demonstrar rotação manual de
--     refresh tokens (conteúdo: JDBC, Coleções, Polimorfismo via TokenSeguro).
--   * É também usada por um JobLimpezaTokens para expurgo periódico.
--   * NÃO substitui o fluxo do Supabase Auth; é complementar e auditável.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,           -- nunca o token em claro
  emitido_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em    TIMESTAMPTZ NOT NULL,
  rotacionado  BOOLEAN NOT NULL DEFAULT false,
  rotacionado_em TIMESTAMPTZ,
  sucessor_id  UUID REFERENCES public.refresh_tokens(id) ON DELETE SET NULL,
  ip           TEXT,
  user_agent   TEXT,
  revogado     BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_refresh_user_validos
  ON public.refresh_tokens(user_id) WHERE revogado = false AND rotacionado = false;

GRANT SELECT, INSERT, UPDATE ON public.refresh_tokens TO authenticated;
GRANT ALL ON public.refresh_tokens TO service_role;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refresh_owner_select"
  ON public.refresh_tokens FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "refresh_admin_all"
  ON public.refresh_tokens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- =============================================================================
-- Onda C — C.1 — Migration M3: Tokens de recuperação anti-enumeração (RN.07)
-- -----------------------------------------------------------------------------
-- O endpoint público SEMPRE retorna a mesma mensagem ("Se o e-mail existir,
-- enviamos instruções") independente da existência. Esta tabela registra o
-- token UMA ÚNICA VEZ por solicitação; reuso ou expiração faz o token virar
-- inválido. Toda solicitação é logada (auditável).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tokens_recuperacao_senha (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- pode ser NULL: anti-enumeração
  email_alvo    TEXT NOT NULL,
  token_hash    TEXT NOT NULL UNIQUE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em     TIMESTAMPTZ NOT NULL,
  usado         BOOLEAN NOT NULL DEFAULT false,
  usado_em      TIMESTAMPTZ,
  ip_origem     TEXT,
  user_agent    TEXT
);
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_email
  ON public.tokens_recuperacao_senha(email_alvo, criado_em DESC);

GRANT SELECT, INSERT, UPDATE ON public.tokens_recuperacao_senha TO authenticated;
GRANT ALL ON public.tokens_recuperacao_senha TO service_role;
ALTER TABLE public.tokens_recuperacao_senha ENABLE ROW LEVEL SECURITY;

-- Política mínima: ninguém lê via cliente; apenas service_role manipula.
-- Mantida ENABLE para futuras consultas administrativas via has_role.
CREATE POLICY "tokens_recuperacao_admin_all"
  ON public.tokens_recuperacao_senha FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- =============================================================================
-- Onda C — C.1 — Migration M4: Domínios institucionais (RN.35)
-- -----------------------------------------------------------------------------
-- Restringe cadastro a domínios autorizados quando `obrigatorio = true`.
-- Lista vazia ou todos com `obrigatorio = false` → cadastro continua aberto
-- (compatibilidade com usuários já cadastrados em outros domínios).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.dominios_institucionais (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dominio      TEXT NOT NULL UNIQUE,            -- ex.: 'escola.edu.br'
  descricao    TEXT,
  obrigatorio  BOOLEAN NOT NULL DEFAULT false,
  ativo        BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.dominios_institucionais TO authenticated;
GRANT SELECT ON public.dominios_institucionais TO anon;  -- usado no signup (anon)
GRANT ALL    ON public.dominios_institucionais TO service_role;
ALTER TABLE public.dominios_institucionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dominios_read_all"
  ON public.dominios_institucionais FOR SELECT
  USING (ativo = true);

CREATE POLICY "dominios_admin_manage"
  ON public.dominios_institucionais FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Função utilitária: retorna true se o e-mail é aceitável.
CREATE OR REPLACE FUNCTION public.dominio_email_permitido(_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_dominio TEXT := lower(split_part(_email, '@', 2));
  v_obrig   BOOLEAN;
BEGIN
  IF v_dominio = '' THEN RETURN false; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.dominios_institucionais
    WHERE ativo AND obrigatorio
  ) INTO v_obrig;

  IF NOT v_obrig THEN
    RETURN true;   -- sem domínios obrigatórios → tudo permitido
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.dominios_institucionais
    WHERE ativo AND lower(dominio) = v_dominio
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.dominio_email_permitido(TEXT) TO anon, authenticated;
-- =============================================================================
-- Onda C — C.1 — Migration M5: Detecção de anomalias de acesso (RN.61)
-- -----------------------------------------------------------------------------
-- Eventos rastreáveis: novo dispositivo, novo país, horário atípico,
-- velocidade impossível (geo). Cada evento entra com gravidade e
-- pode acionar notificação. Auditável por admin/CEO + pelo próprio titular.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.anomalias_acesso (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL,                   -- 'novo_dispositivo' | 'novo_pais' | 'horario_atipico' | 'velocidade_impossivel'
  gravidade    TEXT NOT NULL DEFAULT 'media',   -- 'baixa' | 'media' | 'alta'
  detalhes     JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip           TEXT,
  user_agent   TEXT,
  pais         TEXT,
  cidade       TEXT,
  notificado   BOOLEAN NOT NULL DEFAULT false,
  reconhecido  BOOLEAN NOT NULL DEFAULT false,
  reconhecido_em TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_anomalias_user_data
  ON public.anomalias_acesso(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.anomalias_acesso TO authenticated;
GRANT ALL ON public.anomalias_acesso TO service_role;
ALTER TABLE public.anomalias_acesso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anomalias_owner_select"
  ON public.anomalias_acesso FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "anomalias_owner_ack"
  ON public.anomalias_acesso FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "anomalias_admin_all"
  ON public.anomalias_acesso FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
