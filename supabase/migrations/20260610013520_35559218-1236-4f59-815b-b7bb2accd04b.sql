-- =============================================================================
-- Onda C — C.1 — Migration M2: Rotação de refresh tokens (RN.03)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,
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
CREATE POLICY "refresh_owner_select" ON public.refresh_tokens FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "refresh_admin_all" ON public.refresh_tokens FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================================================
-- Onda C — C.1 — Migration M3: Tokens de recuperação anti-enumeração (RN.07)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tokens_recuperacao_senha (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_alvo    TEXT NOT NULL,
  token_hash    TEXT NOT NULL UNIQUE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em     TIMESTAMPTZ NOT NULL,
  usado         BOOLEAN NOT NULL DEFAULT false,
  usado_em      TIMESTAMPTZ,
  ip_origem     TEXT,
  user_agent    TEXT
);
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_email ON public.tokens_recuperacao_senha(email_alvo, criado_em DESC);
GRANT SELECT, INSERT, UPDATE ON public.tokens_recuperacao_senha TO authenticated;
GRANT ALL ON public.tokens_recuperacao_senha TO service_role;
ALTER TABLE public.tokens_recuperacao_senha ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tokens_recuperacao_admin_all" ON public.tokens_recuperacao_senha FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================================================
-- Onda C — C.1 — Migration M4: Domínios institucionais (RN.35)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.dominios_institucionais (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dominio      TEXT NOT NULL UNIQUE,
  descricao    TEXT,
  obrigatorio  BOOLEAN NOT NULL DEFAULT false,
  ativo        BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dominios_institucionais TO authenticated;
GRANT SELECT ON public.dominios_institucionais TO anon;
GRANT ALL    ON public.dominios_institucionais TO service_role;
ALTER TABLE public.dominios_institucionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dominios_read_all" ON public.dominios_institucionais FOR SELECT USING (ativo = true);
CREATE POLICY "dominios_admin_manage" ON public.dominios_institucionais FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.dominio_email_permitido(_email TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_dominio TEXT := lower(split_part(_email, '@', 2));
  v_obrig   BOOLEAN;
BEGIN
  IF v_dominio = '' THEN RETURN false; END IF;
  SELECT EXISTS (SELECT 1 FROM public.dominios_institucionais WHERE ativo AND obrigatorio) INTO v_obrig;
  IF NOT v_obrig THEN RETURN true; END IF;
  RETURN EXISTS (SELECT 1 FROM public.dominios_institucionais WHERE ativo AND lower(dominio) = v_dominio);
END;
$$;
GRANT EXECUTE ON FUNCTION public.dominio_email_permitido(TEXT) TO anon, authenticated;

-- =============================================================================
-- Onda C — C.1 — Migration M5: Detecção de anomalias de acesso (RN.61)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.anomalias_acesso (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL,
  gravidade    TEXT NOT NULL DEFAULT 'media',
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
CREATE INDEX IF NOT EXISTS idx_anomalias_user_data ON public.anomalias_acesso(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.anomalias_acesso TO authenticated;
GRANT ALL ON public.anomalias_acesso TO service_role;
ALTER TABLE public.anomalias_acesso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anomalias_owner_select" ON public.anomalias_acesso FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "anomalias_owner_ack" ON public.anomalias_acesso FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "anomalias_admin_all" ON public.anomalias_acesso FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
