-- AVALIAÇÕES
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  materia TEXT NOT NULL DEFAULT '',
  titulo TEXT NOT NULL,
  data DATE,
  media NUMERIC(4,2),
  alunos INT NOT NULL DEFAULT 0,
  tone TEXT NOT NULL DEFAULT 'blue',
  peso INT NOT NULL DEFAULT 1,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_avaliacoes_turma ON public.avaliacoes(turma_id);
CREATE INDEX idx_avaliacoes_professor ON public.avaliacoes(professor_id);
CREATE TRIGGER trg_avaliacoes_updated_at BEFORE UPDATE ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem todas as avaliações" ON public.avaliacoes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Professores veem avaliações da sua turma" ON public.avaliacoes FOR SELECT TO authenticated
  USING (public.is_professor_of_turma(turma_id));
CREATE POLICY "Alunos veem avaliações da própria turma" ON public.avaliacoes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.turma_id = avaliacoes.turma_id
      AND a.profile_id = public.current_profile_id()
  ));
CREATE POLICY "Professores criam avaliações da sua turma" ON public.avaliacoes FOR INSERT TO authenticated
  WITH CHECK (public.is_professor_of_turma(turma_id) AND professor_id = public.current_profile_id());
CREATE POLICY "Professores atualizam avaliações da sua turma" ON public.avaliacoes FOR UPDATE TO authenticated
  USING (public.is_professor_of_turma(turma_id))
  WITH CHECK (public.is_professor_of_turma(turma_id));
CREATE POLICY "Professores removem avaliações da sua turma" ON public.avaliacoes FOR DELETE TO authenticated
  USING (public.is_professor_of_turma(turma_id));
CREATE POLICY "Admins administram avaliações" ON public.avaliacoes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
