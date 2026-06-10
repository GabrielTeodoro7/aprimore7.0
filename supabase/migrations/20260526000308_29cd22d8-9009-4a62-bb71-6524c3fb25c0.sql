-- =========================================================
-- ENUM de papéis (CEO incluso desde o início)
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('ceo', 'admin', 'professor', 'aluno');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'aluno',
  escola TEXT,
  professor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  turma TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  ultimo_acesso TIMESTAMPTZ,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  cargo TEXT,
  ano TEXT,
  theme TEXT NOT NULL DEFAULT 'light',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_professor_id ON public.profiles(professor_id);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role = _role OR role = 'ceo')
  );
$$;

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_ceo(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'ceo');
$$;

CREATE OR REPLACE FUNCTION public.is_demo_user(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_demo FROM public.profiles WHERE user_id = _user_id LIMIT 1), false);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_nome   TEXT := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_role   public.app_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'aluno');
  v_escola TEXT := NEW.raw_user_meta_data->>'escola';
  v_turma  TEXT := NEW.raw_user_meta_data->>'turma';
  v_prof   UUID := NULLIF(NEW.raw_user_meta_data->>'professor_id', '')::UUID;
BEGIN
  INSERT INTO public.profiles (user_id, nome, email, role, escola, turma, professor_id)
  VALUES (NEW.id, v_nome, NEW.email, v_role, v_escola, v_turma, v_prof)
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.current_profile_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_ceo(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_ceo(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_demo_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_demo_user(UUID) TO authenticated;

CREATE POLICY "p_self_select" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "p_admin_select" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "p_prof_select" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'professor') AND professor_id = public.current_profile_id());
CREATE POLICY "p_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid()));
CREATE POLICY "p_admin_update" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "p_admin_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "p_admin_delete" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "ur_self_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ur_admin_select" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ur_admin_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ur_admin_update" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ur_admin_delete" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ano TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_turmas_professor ON public.turmas(professor_id);
CREATE TRIGGER trg_turmas_updated_at BEFORE UPDATE ON public.turmas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_professor_of_turma(_turma_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.turmas t WHERE t.id = _turma_id AND t.professor_id = public.current_profile_id());
$$;
REVOKE EXECUTE ON FUNCTION public.is_professor_of_turma(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_professor_of_turma(UUID) TO authenticated;

CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome TEXT NOT NULL, idade INT, media NUMERIC(4,2), freq TEXT,
  tag TEXT NOT NULL DEFAULT 'Regular', tone TEXT NOT NULL DEFAULT 'blue',
  responsavel TEXT, email TEXT, telefone TEXT, observacoes TEXT, necessidade TEXT,
  estrelas INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_alunos_turma ON public.alunos(turma_id);
CREATE INDEX idx_alunos_profile ON public.alunos(profile_id);
CREATE TRIGGER trg_alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_aluno_owner(_aluno_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.alunos a WHERE a.id = _aluno_id AND a.profile_id = public.current_profile_id());
$$;
REVOKE EXECUTE ON FUNCTION public.is_aluno_owner(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_aluno_owner(UUID) TO authenticated;

CREATE TABLE public.atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL, materia TEXT NOT NULL DEFAULT '', data DATE,
  tone TEXT NOT NULL DEFAULT 'blue', adaptada BOOLEAN NOT NULL DEFAULT false,
  descricao TEXT,
  objetivos TEXT[] NOT NULL DEFAULT '{}',
  materiais TEXT[] NOT NULL DEFAULT '{}',
  passos TEXT[] NOT NULL DEFAULT '{}',
  dificuldade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_atividades_turma_data ON public.atividades(turma_id, data);
CREATE INDEX idx_atividades_professor ON public.atividades(professor_id);
CREATE TRIGGER trg_atividades_updated_at BEFORE UPDATE ON public.atividades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.atividade_alunos (
  atividade_id UUID NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  PRIMARY KEY (atividade_id, aluno_id)
);
ALTER TABLE public.atividade_alunos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.submissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id UUID NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente',
  nota NUMERIC(4,2), feedback TEXT, entregue_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (atividade_id, aluno_id)
);
CREATE INDEX idx_submissoes_aluno ON public.submissoes(aluno_id);
CREATE TRIGGER trg_submissoes_updated_at BEFORE UPDATE ON public.submissoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.submissoes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.frequencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT true,
  justificativa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, data)
);
CREATE INDEX idx_frequencia_turma_data ON public.frequencia(turma_id, data);
ALTER TABLE public.frequencia ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remetente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destinatario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mensagens_destinatario ON public.mensagens(destinatario_id);
CREATE INDEX idx_mensagens_turma ON public.mensagens(turma_id);
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL, corpo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comunicados_turma ON public.comunicados(turma_id);
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  emocao TEXT NOT NULL, emoji TEXT, intensidade INT, nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sentimentos_aluno_data ON public.sentimentos(aluno_id, created_at DESC);
ALTER TABLE public.sentimentos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, titulo TEXT NOT NULL,
  descricao TEXT, emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conquistas_aluno ON public.conquistas(aluno_id);
ALTER TABLE public.conquistas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  acao TEXT NOT NULL, entidade TEXT NOT NULL,
  entidade_id UUID, payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  materia TEXT NOT NULL DEFAULT '',
  titulo TEXT NOT NULL, data DATE, media NUMERIC(4,2),
  alunos INT NOT NULL DEFAULT 0, tone TEXT NOT NULL DEFAULT 'blue',
  peso INT NOT NULL DEFAULT 1, observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_avaliacoes_turma ON public.avaliacoes(turma_id);
CREATE INDEX idx_avaliacoes_professor ON public.avaliacoes(professor_id);
CREATE TRIGGER trg_avaliacoes_updated_at BEFORE UPDATE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rotina_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  hora TEXT NOT NULL, titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '', emoji TEXT NOT NULL DEFAULT '⭐',
  status TEXT NOT NULL DEFAULT 'pendente', posicao INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rotina_aluno ON public.rotina_itens(aluno_id);
CREATE TRIGGER trg_rotina_updated_at BEFORE UPDATE ON public.rotina_itens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.rotina_itens ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL, sub TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT 'blue', read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notificacoes_profile ON public.notificacoes(profile_id, read);
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

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