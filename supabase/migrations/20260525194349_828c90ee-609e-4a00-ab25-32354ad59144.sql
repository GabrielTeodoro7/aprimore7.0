-- =========================================================
-- ENUM de papéis
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'professor', 'aluno');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- profiles
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_professor_id ON public.profiles(professor_id);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_roles
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
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
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

-- RLS profiles
CREATE POLICY "Usuários veem o próprio perfil" ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins veem todos os perfis" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Professores veem alunos vinculados" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'professor') AND professor_id = public.current_profile_id());
CREATE POLICY "Usuário atualiza o próprio perfil" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid()));
CREATE POLICY "Admins atualizam qualquer perfil" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins inserem perfis" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins removem perfis" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS user_roles
CREATE POLICY "Usuário vê os próprios papéis" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins veem todos os papéis" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins inserem papéis" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins atualizam papéis" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins removem papéis" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- TURMAS
CREATE TABLE public.turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ano TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_turmas_professor ON public.turmas(professor_id);
CREATE TRIGGER trg_turmas_updated_at BEFORE UPDATE ON public.turmas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_professor_of_turma(_turma_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.turmas t
    WHERE t.id = _turma_id AND t.professor_id = public.current_profile_id());
$$;
REVOKE EXECUTE ON FUNCTION public.is_professor_of_turma(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_professor_of_turma(UUID) TO authenticated;

-- ALUNOS
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  idade INT,
  media NUMERIC(4,2),
  freq TEXT,
  tag TEXT NOT NULL DEFAULT 'Regular',
  tone TEXT NOT NULL DEFAULT 'blue',
  responsavel TEXT, email TEXT, telefone TEXT,
  observacoes TEXT, necessidade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_alunos_turma ON public.alunos(turma_id);
CREATE INDEX idx_alunos_profile ON public.alunos(profile_id);
CREATE TRIGGER trg_alunos_updated_at BEFORE UPDATE ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_aluno_owner(_aluno_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.alunos a
    WHERE a.id = _aluno_id AND a.profile_id = public.current_profile_id());
$$;
REVOKE EXECUTE ON FUNCTION public.is_aluno_owner(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_aluno_owner(UUID) TO authenticated;

-- ATIVIDADES
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
CREATE TRIGGER trg_atividades_updated_at BEFORE UPDATE ON public.atividades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
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
CREATE TRIGGER trg_submissoes_updated_at BEFORE UPDATE ON public.submissoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.submissoes ENABLE ROW LEVEL SECURITY;

-- FREQUÊNCIA / MENSAGENS / COMUNICADOS / SENTIMENTOS / CONQUISTAS / AUDIT
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

-- RLS DOMÍNIO
CREATE POLICY "Admins gerenciam turmas" ON public.turmas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Professor gerencia suas turmas" ON public.turmas FOR ALL TO authenticated
  USING (professor_id = public.current_profile_id())
  WITH CHECK (professor_id = public.current_profile_id());
CREATE POLICY "Aluno vê turma onde está matriculado" ON public.turmas FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.alunos a
    WHERE a.turma_id = turmas.id AND a.profile_id = public.current_profile_id()));

CREATE POLICY "Admins gerenciam alunos" ON public.alunos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Professor gerencia alunos das suas turmas" ON public.alunos FOR ALL TO authenticated
  USING (public.is_professor_of_turma(turma_id))
  WITH CHECK (public.is_professor_of_turma(turma_id));
CREATE POLICY "Aluno vê próprio registro" ON public.alunos FOR SELECT TO authenticated
  USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins gerenciam atividades" ON public.atividades FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Professor gerencia atividades das suas turmas" ON public.atividades FOR ALL TO authenticated
  USING (public.is_professor_of_turma(turma_id))
  WITH CHECK (public.is_professor_of_turma(turma_id));
CREATE POLICY "Aluno vê atividades da sua turma" ON public.atividades FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.alunos a
    WHERE a.turma_id = atividades.turma_id AND a.profile_id = public.current_profile_id()));

CREATE POLICY "Admins gerenciam atribuições" ON public.atividade_alunos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Professor gerencia atribuições" ON public.atividade_alunos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.atividades at WHERE at.id = atividade_alunos.atividade_id AND public.is_professor_of_turma(at.turma_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.atividades at WHERE at.id = atividade_alunos.atividade_id AND public.is_professor_of_turma(at.turma_id)));
CREATE POLICY "Aluno vê suas atribuições" ON public.atividade_alunos FOR SELECT TO authenticated
  USING (public.is_aluno_owner(aluno_id));

CREATE POLICY "Admins gerenciam submissões" ON public.submissoes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Professor gerencia submissões da turma" ON public.submissoes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.atividades at WHERE at.id = submissoes.atividade_id AND public.is_professor_of_turma(at.turma_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.atividades at WHERE at.id = submissoes.atividade_id AND public.is_professor_of_turma(at.turma_id)));
CREATE POLICY "Aluno vê suas submissões" ON public.submissoes FOR SELECT TO authenticated
  USING (public.is_aluno_owner(aluno_id));
CREATE POLICY "Aluno entrega atividade" ON public.submissoes FOR INSERT TO authenticated
  WITH CHECK (public.is_aluno_owner(aluno_id));
CREATE POLICY "Aluno atualiza própria entrega" ON public.submissoes FOR UPDATE TO authenticated
  USING (public.is_aluno_owner(aluno_id)) WITH CHECK (public.is_aluno_owner(aluno_id));

CREATE POLICY "Admins gerenciam frequência" ON public.frequencia FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Professor gerencia frequência da turma" ON public.frequencia FOR ALL TO authenticated
  USING (public.is_professor_of_turma(turma_id))
  WITH CHECK (public.is_professor_of_turma(turma_id));
CREATE POLICY "Aluno vê própria frequência" ON public.frequencia FOR SELECT TO authenticated
  USING (public.is_aluno_owner(aluno_id));

CREATE POLICY "Vê mensagens enviadas ou recebidas" ON public.mensagens FOR SELECT TO authenticated
  USING (
    remetente_id = public.current_profile_id()
    OR destinatario_id = public.current_profile_id()
    OR (turma_id IS NOT NULL AND (public.is_professor_of_turma(turma_id)
      OR EXISTS (SELECT 1 FROM public.alunos a WHERE a.turma_id = mensagens.turma_id AND a.profile_id = public.current_profile_id())))
  );
CREATE POLICY "Envia como si mesmo" ON public.mensagens FOR INSERT TO authenticated
  WITH CHECK (remetente_id = public.current_profile_id());
CREATE POLICY "Marca como lida" ON public.mensagens FOR UPDATE TO authenticated
  USING (destinatario_id = public.current_profile_id())
  WITH CHECK (destinatario_id = public.current_profile_id());

CREATE POLICY "Admins gerenciam comunicados" ON public.comunicados FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Professor gerencia comunicados da turma" ON public.comunicados FOR ALL TO authenticated
  USING (public.is_professor_of_turma(turma_id))
  WITH CHECK (public.is_professor_of_turma(turma_id) AND professor_id = public.current_profile_id());
CREATE POLICY "Aluno vê comunicados da sua turma" ON public.comunicados FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.alunos a WHERE a.turma_id = comunicados.turma_id AND a.profile_id = public.current_profile_id()));

CREATE POLICY "Aluno registra próprios sentimentos" ON public.sentimentos FOR INSERT TO authenticated
  WITH CHECK (public.is_aluno_owner(aluno_id));
CREATE POLICY "Aluno vê próprios sentimentos" ON public.sentimentos FOR SELECT TO authenticated
  USING (public.is_aluno_owner(aluno_id));
CREATE POLICY "Professor vê sentimentos dos seus alunos" ON public.sentimentos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.alunos a WHERE a.id = sentimentos.aluno_id AND public.is_professor_of_turma(a.turma_id)));
CREATE POLICY "Admins veem sentimentos" ON public.sentimentos FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins gerenciam conquistas" ON public.conquistas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Aluno vê conquistas" ON public.conquistas FOR SELECT TO authenticated
  USING (public.is_aluno_owner(aluno_id));
CREATE POLICY "Professor gerencia conquistas dos alunos" ON public.conquistas FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.alunos a WHERE a.id = conquistas.aluno_id AND public.is_professor_of_turma(a.turma_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.alunos a WHERE a.id = conquistas.aluno_id AND public.is_professor_of_turma(a.turma_id)));

CREATE POLICY "Authenticated inserem log" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = public.current_profile_id() OR actor_id IS NULL);
CREATE POLICY "Admins veem logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));