
-- =====================================================
-- ONDA B.1 — FUNDAÇÃO LGPD / PRIVACIDADE
-- =====================================================

-- ----------- 1) ENUM finalidade de consentimento -----------
DO $$ BEGIN
  CREATE TYPE public.finalidade_consentimento AS ENUM (
    'CADASTRO', 'IMAGEM', 'COMUNICACOES', 'COMPARTILHAMENTO'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.tipo_documento_legal AS ENUM (
    'TERMOS_USO', 'POLITICA_PRIVACIDADE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------- 2) documentos_legais (RN.05) -----------
CREATE TABLE IF NOT EXISTS public.documentos_legais (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo         public.tipo_documento_legal NOT NULL,
  versao       text NOT NULL,
  texto        text NOT NULL,
  vigente_em   timestamptz NOT NULL DEFAULT now(),
  obrigatorio  boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tipo, versao)
);
GRANT SELECT ON public.documentos_legais TO authenticated;
GRANT ALL    ON public.documentos_legais TO service_role;
ALTER TABLE public.documentos_legais ENABLE ROW LEVEL SECURITY;

CREATE POLICY dl_sel_auth ON public.documentos_legais FOR SELECT TO authenticated USING (true);
CREATE POLICY dl_admin    ON public.documentos_legais FOR ALL    TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ----------- 3) termos_aceitos (RN.05) — imutável -----------
CREATE TABLE IF NOT EXISTS public.termos_aceitos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL,
  documento_id  uuid NOT NULL REFERENCES public.documentos_legais(id) ON DELETE RESTRICT,
  aceito_em     timestamptz NOT NULL DEFAULT now(),
  ip            text,
  user_agent    text,
  UNIQUE (profile_id, documento_id)
);
GRANT SELECT, INSERT ON public.termos_aceitos TO authenticated;
GRANT ALL ON public.termos_aceitos TO service_role;
ALTER TABLE public.termos_aceitos ENABLE ROW LEVEL SECURITY;

CREATE POLICY ta_self_sel ON public.termos_aceitos FOR SELECT TO authenticated
  USING (profile_id = public.current_profile_id());
CREATE POLICY ta_admin_sel ON public.termos_aceitos FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY ta_self_ins ON public.termos_aceitos FOR INSERT TO authenticated
  WITH CHECK (profile_id = public.current_profile_id());

-- imutabilidade
CREATE TRIGGER trg_termos_aceitos_block_upd
  BEFORE UPDATE ON public.termos_aceitos
  FOR EACH ROW EXECUTE FUNCTION public.block_audit_mutation();
CREATE TRIGGER trg_termos_aceitos_block_del
  BEFORE DELETE ON public.termos_aceitos
  FOR EACH ROW EXECUTE FUNCTION public.block_audit_mutation();

-- ----------- 4) consentimentos (RN.45) -----------
CREATE TABLE IF NOT EXISTS public.consentimentos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid NOT NULL,
  finalidade   public.finalidade_consentimento NOT NULL,
  concedido    boolean NOT NULL,
  concedido_em timestamptz,
  revogado_em  timestamptz,
  ip           text,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, finalidade)
);
GRANT SELECT, INSERT, UPDATE ON public.consentimentos TO authenticated;
GRANT ALL ON public.consentimentos TO service_role;
ALTER TABLE public.consentimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY cs_self ON public.consentimentos FOR ALL TO authenticated
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());
CREATE POLICY cs_admin_sel ON public.consentimentos FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_consentimentos_upd
  BEFORE UPDATE ON public.consentimentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------- 5) logs_acesso_sensiveis (RN.63) — imutável -----------
CREATE TABLE IF NOT EXISTS public.logs_acesso_sensiveis (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        uuid,
  aluno_id        uuid,
  campo           text NOT NULL,
  justificativa   text,
  contexto_normal boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.logs_acesso_sensiveis TO authenticated;
GRANT ALL ON public.logs_acesso_sensiveis TO service_role;
ALTER TABLE public.logs_acesso_sensiveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY las_admin_sel ON public.logs_acesso_sensiveis FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY las_self_ins ON public.logs_acesso_sensiveis FOR INSERT TO authenticated
  WITH CHECK (actor_id = public.current_profile_id() OR actor_id IS NULL);

CREATE TRIGGER trg_logs_sens_block_upd
  BEFORE UPDATE ON public.logs_acesso_sensiveis
  FOR EACH ROW EXECUTE FUNCTION public.block_audit_mutation();
CREATE TRIGGER trg_logs_sens_block_del
  BEFORE DELETE ON public.logs_acesso_sensiveis
  FOR EACH ROW EXECUTE FUNCTION public.block_audit_mutation();

-- ----------- 6) lgpd_exportacoes (RN.34) -----------
CREATE TABLE IF NOT EXISTS public.lgpd_exportacoes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid NOT NULL,
  status       text NOT NULL DEFAULT 'pendente', -- pendente | processando | pronto | erro
  storage_path text,
  expira_em    timestamptz,
  erro         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.lgpd_exportacoes TO authenticated;
GRANT ALL ON public.lgpd_exportacoes TO service_role;
ALTER TABLE public.lgpd_exportacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY exp_self ON public.lgpd_exportacoes FOR ALL TO authenticated
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());
CREATE POLICY exp_admin_sel ON public.lgpd_exportacoes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_exp_upd
  BEFORE UPDATE ON public.lgpd_exportacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------- 7) ripd_relatorios (RN.46) -----------
CREATE TABLE IF NOT EXISTS public.ripd_relatorios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trimestre     int NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  ano           int NOT NULL,
  storage_path  text,
  resumo        jsonb,
  gerado_em     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ano, trimestre)
);
GRANT SELECT, INSERT ON public.ripd_relatorios TO authenticated;
GRANT ALL ON public.ripd_relatorios TO service_role;
ALTER TABLE public.ripd_relatorios ENABLE ROW LEVEL SECURITY;

CREATE POLICY ripd_admin ON public.ripd_relatorios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ----------- 8) Soft delete + anonimização (RN.31, RN.32) -----------
ALTER TABLE public.alunos     ADD COLUMN IF NOT EXISTS deletado_em        timestamptz;
ALTER TABLE public.alunos     ADD COLUMN IF NOT EXISTS anonimizado        boolean NOT NULL DEFAULT false;
ALTER TABLE public.alunos     ADD COLUMN IF NOT EXISTS data_desligamento  date;
ALTER TABLE public.turmas     ADD COLUMN IF NOT EXISTS deletado_em        timestamptz;
ALTER TABLE public.atividades ADD COLUMN IF NOT EXISTS deletado_em        timestamptz;
ALTER TABLE public.avaliacoes ADD COLUMN IF NOT EXISTS deletado_em        timestamptz;
ALTER TABLE public.profiles   ADD COLUMN IF NOT EXISTS deletado_em        timestamptz;

-- View utilitária
CREATE OR REPLACE VIEW public.v_alunos_ativos AS
  SELECT * FROM public.alunos
  WHERE deletado_em IS NULL AND anonimizado = false;

GRANT SELECT ON public.v_alunos_ativos TO authenticated;

-- ----------- 9) Trigger de soft delete -----------
CREATE OR REPLACE FUNCTION public.soft_delete_intercept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE allow_hard text;
BEGIN
  BEGIN
    allow_hard := current_setting('app.allow_hard_delete', true);
  EXCEPTION WHEN OTHERS THEN allow_hard := NULL;
  END;
  IF allow_hard = 'on' THEN
    RETURN OLD; -- permite DELETE físico
  END IF;
  EXECUTE format('UPDATE public.%I SET deletado_em = now() WHERE id = $1', TG_TABLE_NAME)
    USING OLD.id;
  RETURN NULL; -- cancela DELETE
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['alunos','turmas','atividades','avaliacoes'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_soft_delete ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_soft_delete BEFORE DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.soft_delete_intercept()',
      t
    );
  END LOOP;
END $$;

-- ----------- 10) Inserts iniciais (STUB legal v2026.1) -----------
INSERT INTO public.documentos_legais (tipo, versao, texto, obrigatorio)
VALUES
  ('TERMOS_USO', '2026.1',
   '[STUB PROVISÓRIO — substituir pelo texto definitivo dos Termos de Uso]
Esta é uma versão provisória dos Termos de Uso do sistema Aprimore, gerada automaticamente como placeholder para suportar a infraestrutura do RN.05 (LGPD). O texto final deve ser fornecido pelo time jurídico e substituído nesta tabela mantendo a coluna versao com nova versao (ex: 2026.2).',
   true),
  ('POLITICA_PRIVACIDADE', '2026.1',
   '[STUB PROVISÓRIO — substituir pelo texto definitivo da Política de Privacidade]
Esta é uma versão provisória da Política de Privacidade do sistema Aprimore, gerada automaticamente como placeholder para suportar a infraestrutura do RN.05 (LGPD). O texto final deve ser fornecido pelo Encarregado/DPO e substituído mantendo coluna versao com nova versao.',
   true)
ON CONFLICT (tipo, versao) DO NOTHING;
