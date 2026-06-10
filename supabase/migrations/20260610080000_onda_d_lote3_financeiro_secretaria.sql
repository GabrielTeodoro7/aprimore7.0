-- ============================================================
-- ONDA D — Lote 3: Secretaria e Financeiro Base
-- RNs: RN.71, RN.72, RN.73, RN.74, RN.75, RN.76, RN.77
-- ============================================================

-- RN.71, RN.72: Matrículas e Documentação
CREATE TABLE IF NOT EXISTS public.documentos_aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL, -- 'RG', 'CPF', 'HISTORICO', 'LAUDO'
    url_arquivo TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'VALIDADO', 'RECUSADO')),
    observacao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    validado_em TIMESTAMPTZ,
    validado_por UUID REFERENCES public.profiles(id)
);

GRANT SELECT, INSERT, UPDATE ON public.documentos_aluno TO authenticated;
GRANT ALL ON public.documentos_aluno TO service_role;
ALTER TABLE public.documentos_aluno ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documentos_aluno_view" ON public.documentos_aluno FOR SELECT TO authenticated
    USING (
        aluno_id IN (SELECT id FROM public.alunos WHERE profile_id = public.current_profile_id())
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'ceo')
    );

-- RN.74, RN.75, RN.76, RN.77: Financeiro (Mensalidades e Pagamentos)
CREATE TABLE IF NOT EXISTS public.financeiro_mensalidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    valor NUMERIC(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO')),
    data_pagamento TIMESTAMPTZ,
    forma_pagamento TEXT, -- 'BOLETO', 'PIX', 'CARTAO'
    link_pagamento TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.financeiro_mensalidades TO authenticated;
GRANT ALL ON public.financeiro_mensalidades TO service_role;
ALTER TABLE public.financeiro_mensalidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mensalidades_self_view" ON public.financeiro_mensalidades FOR SELECT TO authenticated
    USING (
        aluno_id IN (SELECT id FROM public.alunos WHERE profile_id = public.current_profile_id())
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'ceo')
    );

CREATE TABLE IF NOT EXISTS public.financeiro_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
    dia_vencimento_padrao INTEGER NOT NULL DEFAULT 10,
    multa_atraso_percentual NUMERIC(4,2) DEFAULT 2.00,
    juros_mes_percentual NUMERIC(4,2) DEFAULT 1.00,
    UNIQUE(escola_id)
);

GRANT SELECT ON public.financeiro_config TO authenticated;
GRANT ALL ON public.financeiro_config TO service_role;
ALTER TABLE public.financeiro_config ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.documentos_aluno IS 'Gestão de documentos e pendências de matrícula (RN.71, RN.72)';
COMMENT ON TABLE public.financeiro_mensalidades IS 'Controle de mensalidades e status de pagamento (RN.74-77)';
