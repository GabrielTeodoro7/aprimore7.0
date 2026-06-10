-- ============================================================
-- ONDA D — Lote 2: Offline, Resiliência e IA Avançada
-- RNs: RN.53, RN.54, RN.56, RN.57, RN.58, RN.59, RN.60
-- ============================================================

-- RN.53, RN.54: Fila de Sincronização Offline (Resiliência)
CREATE TABLE IF NOT EXISTS public.sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDENTE', 'SYNCED', 'FAILED')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    synced_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE ON public.sync_queue TO authenticated;
GRANT ALL ON public.sync_queue TO service_role;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_queue_self" ON public.sync_queue FOR ALL TO authenticated USING (user_id = auth.uid());

-- RN.56, RN.57, RN.58, RN.59, RN.60: IA Avançada (SGE - Sistema de Gestão Educacional Inteligente)
-- Tabelas para armazenar sugestões de IA, resumos e interações.

CREATE TABLE IF NOT EXISTS public.ia_sugestoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    tipo_sugestao TEXT NOT NULL, -- 'PLANO_AULA', 'ADAPTACAO_MATERIAL', 'PREVISAO_EVASAO'
    conteudo_original TEXT,
    sugestao_ia TEXT NOT NULL,
    feedback_usuario TEXT, -- 'ACEITA', 'REJEITADA', 'AJUSTADA'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.ia_sugestoes TO authenticated;
GRANT ALL ON public.ia_sugestoes TO service_role;
ALTER TABLE public.ia_sugestoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ia_sugestoes_prof" ON public.ia_sugestoes FOR ALL TO authenticated 
    USING (professor_id = public.current_profile_id());

CREATE TABLE IF NOT EXISTS public.ia_analise_aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    risco_evasao NUMERIC(3,2), -- 0.00 a 1.00
    pontos_fortes TEXT[],
    pontos_melhoria TEXT[],
    plano_acao_sugerido TEXT,
    last_analise_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ia_analise_aluno TO authenticated;
GRANT ALL ON public.ia_analise_aluno TO service_role;
ALTER TABLE public.ia_analise_aluno ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ia_analise_view" ON public.ia_analise_aluno FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.alunos a 
            WHERE a.id = ia_analise_aluno.aluno_id 
            AND (a.profile_id = public.current_profile_id() OR public.is_professor_of_turma(a.turma_id) OR public.has_role(auth.uid(), 'admin'))
        )
    );

COMMENT ON TABLE public.sync_queue IS 'Fila de sincronização para operações offline (RN.53, RN.54)';
COMMENT ON TABLE public.ia_sugestoes IS 'Sugestões geradas por IA para professores (RN.56, RN.57, RN.58)';
COMMENT ON TABLE public.ia_analise_aluno IS 'Análise preditiva de desempenho e evasão via IA (RN.59, RN.60)';
