-- =============================================================================
-- Onda C — Sub-fase C.1 (Segurança e Identidade)
-- Migration M1: Política de senha, histórico, tentativas e bloqueios
-- RNs: RN.01 (complexidade + histórico), RN.02 (bloqueio progressivo),
--      RN.62 (expiração configurável)
-- =============================================================================

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

INSERT INTO public.politica_senha (escopo) VALUES ('global')
  ON CONFLICT (escopo) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.senha_historico (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hash        TEXT NOT NULL,
  algoritmo   TEXT NOT NULL DEFAULT 'PBKDF2WithHmacSHA256',
  iteracoes   INT  NOT NULL DEFAULT 200000,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_senha_historico_user
  ON public.senha_historico(user_id, created_at DESC);

GRANT SELECT, INSERT ON public.senha_historico TO authenticated;
GRANT ALL ON public.senha_historico TO service_role;
ALTER TABLE public.senha_historico ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE IF NOT EXISTS public.tentativas_login (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  user_id     UUID,
  sucesso     BOOLEAN NOT NULL,
  ip          TEXT,
  user_agent  TEXT,
  motivo      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tentativas_email_data
  ON public.tentativas_login(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tentativas_user
  ON public.tentativas_login(user_id, created_at DESC);

GRANT SELECT, INSERT ON public.tentativas_login TO authenticated;
GRANT ALL ON public.tentativas_login TO service_role;
ALTER TABLE public.tentativas_login ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tentativas_owner_select"
  ON public.tentativas_login FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tentativas_admin_all"
  ON public.tentativas_login FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "tentativas_anon_insert_via_service"
  ON public.tentativas_login FOR INSERT TO authenticated
  WITH CHECK (true);

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

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS senha_alterada_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exige_troca       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bloqueado_ate     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ultimo_login      TIMESTAMPTZ;

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
