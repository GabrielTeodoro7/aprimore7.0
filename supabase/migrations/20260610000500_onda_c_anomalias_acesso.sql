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
