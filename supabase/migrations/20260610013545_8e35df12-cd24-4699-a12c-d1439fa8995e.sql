-- RN.37: Preferências de Acessibilidade
CREATE TABLE IF NOT EXISTS preferencias_acessibilidade (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    alto_contraste BOOLEAN DEFAULT false,
    fonte_ampliada BOOLEAN DEFAULT false,
    leitura_tela BOOLEAN DEFAULT false,
    atalhos_teclado BOOLEAN DEFAULT true,
    daltonismo_tipo TEXT CHECK (daltonismo_tipo IN ('NENHUM', 'PROTANOPLA', 'DEUTERANOPLA', 'TRITANOPLA', 'ACROMATOPSIA')),
    ultima_sincronizacao TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.preferencias_acessibilidade TO authenticated;
GRANT ALL ON public.preferencias_acessibilidade TO service_role;
ALTER TABLE preferencias_acessibilidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_pref_self" ON preferencias_acessibilidade FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RN.24: Pranchas de Comunicação
CREATE TABLE IF NOT EXISTS pranchas_comunicacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    layout_json JSONB NOT NULL DEFAULT '{}',
    favorita BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pranchas_comunicacao TO authenticated;
GRANT ALL ON public.pranchas_comunicacao TO service_role;
ALTER TABLE pranchas_comunicacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_prancha_self" ON pranchas_comunicacao FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RN.25: Moderação
CREATE TABLE IF NOT EXISTS denuncias_mensagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mensagem_id UUID NOT NULL,
    denunciante_id UUID REFERENCES auth.users(id),
    motivo TEXT NOT NULL,
    detalhes TEXT,
    status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_ANALISE', 'ACATADA', 'REJEITADA')),
    data_denuncia TIMESTAMPTZ DEFAULT now(),
    data_resolucao TIMESTAMPTZ,
    moderador_id UUID REFERENCES auth.users(id)
);
GRANT SELECT, INSERT, UPDATE ON public.denuncias_mensagem TO authenticated;
GRANT ALL ON public.denuncias_mensagem TO service_role;
ALTER TABLE denuncias_mensagem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_denuncia_self" ON denuncias_mensagem FOR SELECT TO authenticated USING (auth.uid() = denunciante_id);

-- Operação: Feriados e Limites
CREATE TABLE IF NOT EXISTS feriados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    data DATE NOT NULL,
    tipo TEXT CHECK (tipo IN ('FIXO', 'VARIAVEL', 'FACULTATIVO')),
    UNIQUE(data, nome)
);
GRANT SELECT ON public.feriados TO authenticated;
GRANT ALL ON public.feriados TO service_role;
ALTER TABLE feriados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_feriado_select" ON feriados FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS limites_plano (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurso TEXT NOT NULL UNIQUE,
    limite_max INTEGER NOT NULL,
    uso_atual INTEGER DEFAULT 0
);
GRANT SELECT ON public.limites_plano TO authenticated;
GRANT ALL ON public.limites_plano TO service_role;
ALTER TABLE limites_plano ENABLE ROW LEVEL SECURITY;

-- Onda D: Multi-tenant
CREATE TABLE IF NOT EXISTS escolas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    config_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.escolas TO authenticated;
GRANT ALL ON public.escolas TO service_role;
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_escola_select" ON escolas FOR SELECT TO authenticated USING (ativo = true);

DO $$ BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'escola_id') THEN
        ALTER TABLE profiles ADD COLUMN escola_id UUID REFERENCES escolas(id);
    END IF;
END $$;

-- Onda D: Gamificação
CREATE TABLE IF NOT EXISTS selos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    categoria TEXT CHECK (categoria IN ('ACADEMICO', 'COMPORTAMENTAL', 'PARTICIPACAO', 'ESPECIAL')),
    created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.selos TO authenticated;
GRANT ALL ON public.selos TO service_role;
ALTER TABLE selos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_selo_select" ON selos FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS conquistas_aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    selo_id UUID REFERENCES selos(id) ON DELETE CASCADE,
    data_conquista TIMESTAMPTZ DEFAULT now(),
    UNIQUE(aluno_id, selo_id)
);
GRANT SELECT ON public.conquistas_aluno TO authenticated;
GRANT ALL ON public.conquistas_aluno TO service_role;
ALTER TABLE conquistas_aluno ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_conquista_select" ON conquistas_aluno FOR SELECT TO authenticated USING (true);

INSERT INTO selos (nome, descricao, icone, categoria) VALUES
('Nota 10', 'Alcançou média máxima em uma disciplina', 'star', 'ACADEMICO'),
('Frequência Ouro', '100% de presença no mês', 'check', 'PARTICIPACAO'),
('Primeiros Passos', 'Concluiu a primeira atividade', 'rocket', 'ESPECIAL')
ON CONFLICT DO NOTHING;
