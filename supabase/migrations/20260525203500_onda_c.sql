-- Onda C: perfil estendido, estrelas do aluno, rotina e notificações

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cargo TEXT,
  ADD COLUMN IF NOT EXISTS ano TEXT,
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'light';

ALTER TABLE public.alunos
  ADD COLUMN IF NOT EXISTS estrelas INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.rotina_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  hora TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '⭐',
  status TEXT NOT NULL DEFAULT 'pendente',
  posicao INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rotina_aluno ON public.rotina_itens(aluno_id);
CREATE TRIGGER trg_rotina_updated_at BEFORE UPDATE ON public.rotina_itens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.rotina_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rotina_aluno_dono" ON public.rotina_itens
  FOR ALL TO authenticated
  USING (public.is_aluno_owner(aluno_id))
  WITH CHECK (public.is_aluno_owner(aluno_id));

CREATE POLICY "rotina_professor_turma" ON public.rotina_itens
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.alunos a
    JOIN public.turmas t ON t.id = a.turma_id
    WHERE a.id = rotina_itens.aluno_id
      AND t.professor_id = public.current_profile_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.alunos a
    JOIN public.turmas t ON t.id = a.turma_id
    WHERE a.id = rotina_itens.aluno_id
      AND t.professor_id = public.current_profile_id()
  ));

CREATE POLICY "rotina_admin_all" ON public.rotina_itens
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sub TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT 'blue',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notificacoes_profile ON public.notificacoes(profile_id, read);
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_dono" ON public.notificacoes
  FOR ALL TO authenticated
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "notif_admin" ON public.notificacoes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
