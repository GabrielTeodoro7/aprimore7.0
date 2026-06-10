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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO authenticated;
GRANT ALL ON public.turmas TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alunos TO authenticated;
GRANT ALL ON public.alunos TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividades TO authenticated;
GRANT ALL ON public.atividades TO service_role;
CREATE INDEX idx_atividades_turma_data ON public.atividades(turma_id, data);
CREATE INDEX idx_atividades_professor ON public.atividades(professor_id);
CREATE TRIGGER trg_atividades_updated_at BEFORE UPDATE ON public.atividades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.atividade_alunos (
  atividade_id UUID NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  PRIMARY KEY (atividade_id, aluno_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividade_alunos TO authenticated;
GRANT ALL ON public.atividade_alunos TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissoes TO authenticated;
GRANT ALL ON public.submissoes TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.frequencia TO authenticated;
GRANT ALL ON public.frequencia TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensagens TO authenticated;
GRANT ALL ON public.mensagens TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunicados TO authenticated;
GRANT ALL ON public.comunicados TO service_role;
CREATE INDEX idx_comunicados_turma ON public.comunicados(turma_id);
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  emocao TEXT NOT NULL, emoji TEXT, intensidade INT, nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sentimentos TO authenticated;
GRANT ALL ON public.sentimentos TO service_role;
CREATE INDEX idx_sentimentos_aluno_data ON public.sentimentos(aluno_id, created_at DESC);
ALTER TABLE public.sentimentos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, titulo TEXT NOT NULL,
  descricao TEXT, emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conquistas TO authenticated;
GRANT ALL ON public.conquistas TO service_role;
CREATE INDEX idx_conquistas_aluno ON public.conquistas(aluno_id);
ALTER TABLE public.conquistas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  acao TEXT NOT NULL, entidade TEXT NOT NULL,
  entidade_id UUID, payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes TO authenticated;
GRANT ALL ON public.avaliacoes TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rotina_itens TO authenticated;
GRANT ALL ON public.rotina_itens TO service_role;
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;
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
-- ============================================================
-- ONDA A — Núcleo educacional
-- ============================================================

-- 1) Função reutilizável de validação de CPF (algoritmo oficial)
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
    RETURN true; -- opcional
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

-- 2) ALUNOS: coluna cpf opcional, única, validada
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS cpf text;
DO $$ BEGIN
  ALTER TABLE public.alunos ADD CONSTRAINT alunos_cpf_valido CHECK (public.is_valid_cpf(cpf));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS alunos_cpf_unique
  ON public.alunos (regexp_replace(cpf, '\D', '', 'g'))
  WHERE cpf IS NOT NULL;

-- 3) TURMAS: capacidade + trigger
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

-- 4) FREQUENCIA: data válida
DO $$ BEGIN
  ALTER TABLE public.frequencia ADD CONSTRAINT frequencia_data_valida
    CHECK (data >= DATE '2000-01-01' AND data <= CURRENT_DATE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5) AVALIACOES: faixa de nota, peso, data
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

-- 6) SUBMISSOES: nota e status
DO $$ BEGIN
  ALTER TABLE public.submissoes ADD CONSTRAINT submissoes_nota_range
    CHECK (nota IS NULL OR (nota >= 0 AND nota <= 10));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.submissoes ADD CONSTRAINT submissoes_status_valido
    CHECK (status IN ('pendente','entregue','corrigida','atrasada'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7) AUDIT_LOGS: imutável (sem UPDATE/DELETE)
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

CREATE POLICY "Users can read own lgpd exports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lgpd-exports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Service role manages lgpd exports"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'lgpd-exports')
WITH CHECK (bucket_id = 'lgpd-exports');

CREATE POLICY "Admins read ripd reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lgpd-exports'
  AND (storage.foldername(name))[1] = 'ripd'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin','ceo')
  )
);
