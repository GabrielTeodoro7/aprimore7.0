CREATE POLICY "t_admin" ON public.turmas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "t_prof" ON public.turmas FOR ALL TO authenticated USING (professor_id = public.current_profile_id()) WITH CHECK (professor_id = public.current_profile_id());
CREATE POLICY "t_aluno_sel" ON public.turmas FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.alunos a WHERE a.turma_id = turmas.id AND a.profile_id = public.current_profile_id()));

CREATE POLICY "a_admin" ON public.alunos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "a_prof" ON public.alunos FOR ALL TO authenticated USING (public.is_professor_of_turma(turma_id)) WITH CHECK (public.is_professor_of_turma(turma_id));
CREATE POLICY "a_self" ON public.alunos FOR SELECT TO authenticated USING (profile_id = public.current_profile_id());

CREATE POLICY "at_admin" ON public.atividades FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "at_prof" ON public.atividades FOR ALL TO authenticated USING (public.is_professor_of_turma(turma_id)) WITH CHECK (public.is_professor_of_turma(turma_id));
CREATE POLICY "at_aluno_sel" ON public.atividades FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.alunos a WHERE a.turma_id = atividades.turma_id AND a.profile_id = public.current_profile_id()));

CREATE POLICY "aa_admin" ON public.atividade_alunos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "aa_prof" ON public.atividade_alunos FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.atividades at WHERE at.id = atividade_alunos.atividade_id AND public.is_professor_of_turma(at.turma_id))) WITH CHECK (EXISTS (SELECT 1 FROM public.atividades at WHERE at.id = atividade_alunos.atividade_id AND public.is_professor_of_turma(at.turma_id)));
CREATE POLICY "aa_aluno_sel" ON public.atividade_alunos FOR SELECT TO authenticated USING (public.is_aluno_owner(aluno_id));

CREATE POLICY "s_admin" ON public.submissoes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "s_prof" ON public.submissoes FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.atividades at WHERE at.id = submissoes.atividade_id AND public.is_professor_of_turma(at.turma_id))) WITH CHECK (EXISTS (SELECT 1 FROM public.atividades at WHERE at.id = submissoes.atividade_id AND public.is_professor_of_turma(at.turma_id)));
CREATE POLICY "s_aluno_sel" ON public.submissoes FOR SELECT TO authenticated USING (public.is_aluno_owner(aluno_id));
CREATE POLICY "s_aluno_ins" ON public.submissoes FOR INSERT TO authenticated WITH CHECK (public.is_aluno_owner(aluno_id));
CREATE POLICY "s_aluno_upd" ON public.submissoes FOR UPDATE TO authenticated USING (public.is_aluno_owner(aluno_id)) WITH CHECK (public.is_aluno_owner(aluno_id));

CREATE POLICY "f_admin" ON public.frequencia FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "f_prof" ON public.frequencia FOR ALL TO authenticated USING (public.is_professor_of_turma(turma_id)) WITH CHECK (public.is_professor_of_turma(turma_id));
CREATE POLICY "f_aluno_sel" ON public.frequencia FOR SELECT TO authenticated USING (public.is_aluno_owner(aluno_id));

CREATE POLICY "m_sel" ON public.mensagens FOR SELECT TO authenticated USING (
  remetente_id = public.current_profile_id() OR destinatario_id = public.current_profile_id()
  OR (turma_id IS NOT NULL AND (public.is_professor_of_turma(turma_id)
    OR EXISTS (SELECT 1 FROM public.alunos a WHERE a.turma_id = mensagens.turma_id AND a.profile_id = public.current_profile_id())))
);
CREATE POLICY "m_ins" ON public.mensagens FOR INSERT TO authenticated WITH CHECK (remetente_id = public.current_profile_id());
CREATE POLICY "m_upd" ON public.mensagens FOR UPDATE TO authenticated USING (destinatario_id = public.current_profile_id()) WITH CHECK (destinatario_id = public.current_profile_id());

CREATE POLICY "c_admin" ON public.comunicados FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "c_prof" ON public.comunicados FOR ALL TO authenticated USING (public.is_professor_of_turma(turma_id)) WITH CHECK (public.is_professor_of_turma(turma_id) AND professor_id = public.current_profile_id());
CREATE POLICY "c_aluno_sel" ON public.comunicados FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.alunos a WHERE a.turma_id = comunicados.turma_id AND a.profile_id = public.current_profile_id()));

CREATE POLICY "se_aluno_ins" ON public.sentimentos FOR INSERT TO authenticated WITH CHECK (public.is_aluno_owner(aluno_id));
CREATE POLICY "se_aluno_sel" ON public.sentimentos FOR SELECT TO authenticated USING (public.is_aluno_owner(aluno_id));
CREATE POLICY "se_prof_sel" ON public.sentimentos FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.alunos a WHERE a.id = sentimentos.aluno_id AND public.is_professor_of_turma(a.turma_id)));
CREATE POLICY "se_admin_sel" ON public.sentimentos FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "co_admin" ON public.conquistas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "co_aluno_sel" ON public.conquistas FOR SELECT TO authenticated USING (public.is_aluno_owner(aluno_id));
CREATE POLICY "co_prof" ON public.conquistas FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.alunos a WHERE a.id = conquistas.aluno_id AND public.is_professor_of_turma(a.turma_id))) WITH CHECK (EXISTS (SELECT 1 FROM public.alunos a WHERE a.id = conquistas.aluno_id AND public.is_professor_of_turma(a.turma_id)));

CREATE POLICY "log_ins" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = public.current_profile_id() OR actor_id IS NULL);
CREATE POLICY "log_admin_sel" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "av_admin_sel" ON public.avaliacoes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "av_prof_sel" ON public.avaliacoes FOR SELECT TO authenticated USING (public.is_professor_of_turma(turma_id));
CREATE POLICY "av_aluno_sel" ON public.avaliacoes FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.alunos a WHERE a.turma_id = avaliacoes.turma_id AND a.profile_id = public.current_profile_id()));
CREATE POLICY "av_prof_ins" ON public.avaliacoes FOR INSERT TO authenticated WITH CHECK (public.is_professor_of_turma(turma_id) AND professor_id = public.current_profile_id());
CREATE POLICY "av_prof_upd" ON public.avaliacoes FOR UPDATE TO authenticated USING (public.is_professor_of_turma(turma_id)) WITH CHECK (public.is_professor_of_turma(turma_id));
CREATE POLICY "av_prof_del" ON public.avaliacoes FOR DELETE TO authenticated USING (public.is_professor_of_turma(turma_id));
CREATE POLICY "av_admin" ON public.avaliacoes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "rot_aluno" ON public.rotina_itens FOR ALL TO authenticated USING (public.is_aluno_owner(aluno_id)) WITH CHECK (public.is_aluno_owner(aluno_id));
CREATE POLICY "rot_prof" ON public.rotina_itens FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.alunos a JOIN public.turmas t ON t.id = a.turma_id WHERE a.id = rotina_itens.aluno_id AND t.professor_id = public.current_profile_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.alunos a JOIN public.turmas t ON t.id = a.turma_id WHERE a.id = rotina_itens.aluno_id AND t.professor_id = public.current_profile_id()));
CREATE POLICY "rot_admin" ON public.rotina_itens FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "notif_dono" ON public.notificacoes FOR ALL TO authenticated USING (profile_id = public.current_profile_id()) WITH CHECK (profile_id = public.current_profile_id());
CREATE POLICY "notif_admin" ON public.notificacoes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['profiles','user_roles','turmas','alunos','atividades','atividade_alunos','submissoes','frequencia','mensagens','comunicados','sentimentos','conquistas','audit_logs','avaliacoes','rotina_itens','notificacoes'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE POLICY "demo_block_ins" ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (NOT public.is_demo_user(auth.uid()));', t);
    EXECUTE format('CREATE POLICY "demo_block_upd" ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (NOT public.is_demo_user(auth.uid())) WITH CHECK (NOT public.is_demo_user(auth.uid()));', t);
    EXECUTE format('CREATE POLICY "demo_block_del" ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (NOT public.is_demo_user(auth.uid()));', t);
  END LOOP;
END $$;

CREATE POLICY "ceo_profile_imutavel" ON public.profiles AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (role <> 'ceo' OR public.is_ceo(auth.uid()))
  WITH CHECK (role <> 'ceo' OR public.is_ceo(auth.uid()));
CREATE POLICY "ceo_profile_indelevel" ON public.profiles AS RESTRICTIVE FOR DELETE TO authenticated
  USING (role <> 'ceo' OR public.is_ceo(auth.uid()));
CREATE POLICY "ceo_role_imutavel" ON public.user_roles AS RESTRICTIVE FOR ALL TO authenticated
  USING (role <> 'ceo' OR public.is_ceo(auth.uid()))
  WITH CHECK (role <> 'ceo' OR public.is_ceo(auth.uid()));

DO $$
DECLARE
  v_id UUID;
  contas RECORD;
BEGIN
  FOR contas IN
    SELECT * FROM (VALUES
      ('ceo.confidencial@aprimore.internal','Onda#CEO-2826!Aprimore','ceo'::public.app_role,'CEO Aprimore',false),
      ('admin@escola.com','admin123','admin'::public.app_role,'Admin Demo',true),
      ('ana@escola.com','ana123','professor'::public.app_role,'Ana (Professora Demo)',true),
      ('joao@escola.com','joao123','aluno'::public.app_role,'João (Aluno Demo)',true)
    ) AS t(email, senha, papel, nome, is_demo)
  LOOP
    SELECT id INTO v_id FROM auth.users WHERE email = contas.email LIMIT 1;
    IF v_id IS NULL THEN
      v_id := gen_random_uuid();
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        is_super_admin, confirmation_token, email_change,
        email_change_token_new, recovery_token
      ) VALUES (
        v_id, '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        contas.email, crypt(contas.senha, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('nome', contas.nome, 'role', contas.papel::text),
        false, '', '', '', ''
      );
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), v_id,
        jsonb_build_object('sub', v_id::text, 'email', contas.email),
        'email', v_id::text, now(), now(), now()
      );
    END IF;
    INSERT INTO public.profiles (user_id, nome, email, role, is_demo)
    VALUES (v_id, contas.nome, contas.email, contas.papel, contas.is_demo)
    ON CONFLICT (user_id) DO UPDATE
      SET role = EXCLUDED.role, is_demo = EXCLUDED.is_demo, nome = EXCLUDED.nome;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, contas.papel)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.is_valid_cpf(_cpf text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  d text;
  s int;
  i int;
  r int;
  d1 int;
  d2 int;
BEGIN
  IF _cpf IS NULL OR length(trim(_cpf)) = 0 THEN
    RETURN true;
  END IF;
  d := regexp_replace(_cpf, '\D', '', 'g');
  IF length(d) <> 11 THEN RETURN false; END IF;
  IF d ~ '^(\d)\1{10}$' THEN RETURN false; END IF;

  s := 0;
  FOR i IN 1..9 LOOP
    s := s + (substr(d, i, 1))::int * (11 - i);
  END LOOP;
  r := (s * 10) % 11;
  d1 := CASE WHEN r = 10 THEN 0 ELSE r END;
  IF d1 <> (substr(d, 10, 1))::int THEN RETURN false; END IF;

  s := 0;
  FOR i IN 1..10 LOOP
    s := s + (substr(d, i, 1))::int * (12 - i);
  END LOOP;
  r := (s * 10) % 11;
  d2 := CASE WHEN r = 10 THEN 0 ELSE r END;
  RETURN d2 = (substr(d, 11, 1))::int;
END;
$$;

ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS cpf text;
DO $$ BEGIN
  ALTER TABLE public.alunos ADD CONSTRAINT alunos_cpf_valido CHECK (public.is_valid_cpf(cpf));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS alunos_cpf_unique
  ON public.alunos (regexp_replace(cpf, '\D', '', 'g'))
  WHERE cpf IS NOT NULL;

ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS capacidade integer NOT NULL DEFAULT 30;
DO $$ BEGIN
  ALTER TABLE public.turmas ADD CONSTRAINT turmas_capacidade_positiva CHECK (capacidade > 0 AND capacidade <= 200);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.check_turma_capacidade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cap int;
  qtd int;
BEGIN
  SELECT capacidade INTO cap FROM public.turmas WHERE id = NEW.turma_id;
  IF cap IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO qtd FROM public.alunos
    WHERE turma_id = NEW.turma_id
      AND (TG_OP = 'INSERT' OR id <> NEW.id);
  IF qtd >= cap THEN
    RAISE EXCEPTION 'Turma % atingiu a capacidade máxima (%).', NEW.turma_id, cap
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_turma_capacidade ON public.alunos;
CREATE TRIGGER trg_check_turma_capacidade
  BEFORE INSERT OR UPDATE OF turma_id ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION public.check_turma_capacidade();

DO $$ BEGIN
  ALTER TABLE public.frequencia ADD CONSTRAINT frequencia_data_valida
    CHECK (data >= DATE '2000-01-01' AND data <= CURRENT_DATE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_media_range
    CHECK (media IS NULL OR (media >= 0 AND media <= 10));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_peso_range
    CHECK (peso >= 1 AND peso <= 10);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_data_nao_futura
    CHECK (data IS NULL OR data <= CURRENT_DATE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.submissoes ADD CONSTRAINT submissoes_nota_range
    CHECK (nota IS NULL OR (nota >= 0 AND nota <= 10));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.submissoes ADD CONSTRAINT submissoes_status_valido
    CHECK (status IN ('pendente','entregue','corrigida','atrasada'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.block_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs é imutável: % não permitido.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.block_audit_mutation();

REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated, anon;
