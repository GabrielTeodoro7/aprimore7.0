-- Adicionando escola_id em massa (exemplo em tabelas principais caso falhou anteriormente)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'escola_id') THEN
        ALTER TABLE public.profiles ADD COLUMN escola_id UUID REFERENCES public.escolas(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'turmas' AND COLUMN_NAME = 'escola_id') THEN
        ALTER TABLE public.turmas ADD COLUMN escola_id UUID REFERENCES public.escolas(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'alunos' AND COLUMN_NAME = 'escola_id') THEN
        ALTER TABLE public.alunos ADD COLUMN escola_id UUID REFERENCES public.escolas(id);
    END IF;
END $$;

-- RN.65, RN.67: Consolidado de Desempenho (BI)
CREATE TABLE IF NOT EXISTS public.bi_consolidado_turma (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
    media_geral NUMERIC(4,2),
    percentual_aprovacao NUMERIC(5,2),
    total_alunos INTEGER,
    referencia_mes_ano TEXT NOT NULL, -- 'MM/YYYY'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(turma_id, referencia_mes_ano)
);

GRANT SELECT ON public.bi_consolidado_turma TO authenticated;
GRANT ALL ON public.bi_consolidado_turma TO service_role;
ALTER TABLE public.bi_consolidado_turma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bi_consolidado_view" ON public.bi_consolidado_turma FOR SELECT TO authenticated
    USING (public.is_professor_of_turma(turma_id) OR public.has_role(auth.uid(), 'admin'));

-- RN.68, RN.69: Logs de Exportação e Auditoria BI
CREATE TABLE IF NOT EXISTS public.bi_logs_exportacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tipo_dados TEXT NOT NULL, -- 'DESEMPENHO', 'FINANCEIRO', 'FREQUENCIA'
    filtros_aplicados JSONB DEFAULT '{}'::jsonb,
    formato_exportacao TEXT NOT NULL, -- 'PDF', 'CSV', 'XLSX'
    registros_afetados INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.bi_logs_exportacao TO authenticated;
GRANT ALL ON public.bi_logs_exportacao TO service_role;
ALTER TABLE public.bi_logs_exportacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bi_logs_self_view" ON public.bi_logs_exportacao FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- View para BI: Comparativo de Desempenho
CREATE OR REPLACE VIEW public.v_bi_comparativo_escolas AS
    SELECT 
        e.nome as escola_nome,
        count(a.id) as total_alunos,
        avg(a.media) as media_escola
    FROM public.escolas e
    JOIN public.alunos a ON a.escola_id = e.id
    WHERE a.deletado_em IS NULL
    GROUP BY e.nome;

GRANT SELECT ON public.v_bi_comparativo_escolas TO authenticated;

COMMENT ON TABLE public.bi_consolidado_turma IS 'Consolidados mensais para dashboards de BI (RN.65, RN.67)';
COMMENT ON TABLE public.bi_logs_exportacao IS 'Auditoria de exportação de dados analíticos (RN.68, RN.69)';
