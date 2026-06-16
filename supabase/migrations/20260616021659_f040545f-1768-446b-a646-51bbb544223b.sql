
-- ============== 1) Storage: atividades-anexos ==============
DROP POLICY IF EXISTS "Acesso público aos anexos de atividades" ON storage.objects;
DROP POLICY IF EXISTS "Professores podem gerenciar anexos de suas atividades" ON storage.objects;

CREATE POLICY "anexos_select_authorized"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'atividades-anexos'
  AND (
    owner = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'ceo')
  )
);

CREATE POLICY "anexos_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'atividades-anexos'
  AND owner = auth.uid()
);

CREATE POLICY "anexos_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'atividades-anexos' AND owner = auth.uid())
WITH CHECK (bucket_id = 'atividades-anexos' AND owner = auth.uid());

CREATE POLICY "anexos_delete_own_or_admin"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'atividades-anexos'
  AND (
    owner = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'ceo')
  )
);

-- ============== 2) contatos_externos: política quebrada ==============
DROP POLICY IF EXISTS "Professores gerenciam seus contatos externos" ON public.contatos_externos;

CREATE POLICY "contatos_externos_owner_all"
ON public.contatos_externos FOR ALL
TO authenticated
USING (professor_id = public.current_profile_id())
WITH CHECK (professor_id = public.current_profile_id());

CREATE POLICY "contatos_externos_admin_read"
ON public.contatos_externos FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ceo'));

-- ============== 3) conquistas_aluno: SELECT permissivo ==============
DROP POLICY IF EXISTS p_conquista_select ON public.conquistas_aluno;

CREATE POLICY "conquistas_aluno_select_scoped"
ON public.conquistas_aluno FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id = conquistas_aluno.aluno_id
      AND (
        a.profile_id = public.current_profile_id()
        OR public.is_professor_of_turma(a.turma_id)
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'ceo')
      )
  )
);

-- ============== 4) financeiro_config / limites_plano sem políticas ==============
CREATE POLICY "financeiro_config_admin_select"
ON public.financeiro_config FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ceo'));

CREATE POLICY "financeiro_config_admin_write"
ON public.financeiro_config FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ceo'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ceo'));

CREATE POLICY "limites_plano_admin_select"
ON public.limites_plano FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ceo'));

CREATE POLICY "limites_plano_admin_write"
ON public.limites_plano FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ceo'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ceo'));

-- ============== 5) Views com SECURITY DEFINER ==============
DROP VIEW IF EXISTS public.v_alunos_ativos;
CREATE VIEW public.v_alunos_ativos
WITH (security_invoker = on)
AS
SELECT id, turma_id, profile_id, nome, idade, media, freq, tag, tone,
       responsavel, email, telefone, observacoes, necessidade, estrelas,
       created_at, updated_at, cpf, deletado_em, anonimizado, data_desligamento
FROM public.alunos
WHERE deletado_em IS NULL AND anonimizado = false;

DROP VIEW IF EXISTS public.v_bi_comparativo_escolas;
CREATE VIEW public.v_bi_comparativo_escolas
WITH (security_invoker = on)
AS
SELECT e.nome AS escola_nome,
       count(a.id) AS total_alunos,
       avg(a.media) AS media_escola
FROM public.escolas e
JOIN public.alunos a ON a.escola_id = e.id
WHERE a.deletado_em IS NULL
GROUP BY e.nome;

GRANT SELECT ON public.v_alunos_ativos TO authenticated;
GRANT SELECT ON public.v_bi_comparativo_escolas TO authenticated;
