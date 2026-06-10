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
