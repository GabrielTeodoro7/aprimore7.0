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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id UUID NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  UNIQUE(atividade_id, aluno_id)
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
