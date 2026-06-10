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
