-- Migration M21: Multi-tenant (RN.41, 42, 43)
-- O QUE: Tabela de escolas e isolamento de dados.
-- POR QUE: Suporte a múltiplas instituições na mesma plataforma.

CREATE TABLE IF NOT EXISTS escolas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    config_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionando escola_id em massa (exemplo em tabelas principais)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'escola_id') THEN
        ALTER TABLE profiles ADD COLUMN escola_id UUID REFERENCES escolas(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'turmas' AND COLUMN_NAME = 'escola_id') THEN
        ALTER TABLE turmas ADD COLUMN escola_id UUID REFERENCES escolas(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'alunos' AND COLUMN_NAME = 'escola_id') THEN
        ALTER TABLE alunos ADD COLUMN escola_id UUID REFERENCES escolas(id);
    END IF;
END $$;

-- RLS para escolas
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de escolas ativas" ON escolas FOR SELECT USING (ativo = true);

-- RLS Multi-tenant para profiles
-- (As políticas existentes serão complementadas pelo filtro de escola_id via app_metadata ou profile)
-- Exemplo de política de isolamento:
-- CREATE POLICY "Isolamento por escola" ON profiles USING (escola_id = (SELECT escola_id FROM profiles WHERE id = auth.uid()));

COMMENT ON TABLE escolas IS 'Instituições de ensino cadastradas na plataforma (RN.41)';
-- Migration M22: Gamificação (RN.51, 52)
-- O QUE: Tabelas para selos, conquistas e ranking.
-- POR QUE: Motivação e engajamento dos alunos.

CREATE TABLE IF NOT EXISTS selos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    categoria TEXT CHECK (categoria IN ('ACADEMICO', 'COMPORTAMENTAL', 'PARTICIPACAO', 'ESPECIAL')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conquistas_aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    selo_id UUID REFERENCES selos(id) ON DELETE CASCADE,
    data_conquista TIMESTAMPTZ DEFAULT now(),
    UNIQUE(aluno_id, selo_id)
);

CREATE TABLE IF NOT EXISTS ranking_pontuacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    pontos INTEGER DEFAULT 0,
    nivel INTEGER DEFAULT 1,
    ultima_atualizacao TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- RLS
ALTER TABLE selos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos veem selos" ON selos FOR SELECT USING (true);

ALTER TABLE conquistas_aluno ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos veem conquistas" ON conquistas_aluno FOR SELECT USING (true);

ALTER TABLE ranking_pontuacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos veem ranking" ON ranking_pontuacao FOR SELECT USING (true);

-- Seed de selos básicos
INSERT INTO selos (nome, descricao, icone, categoria) VALUES
('Nota 10', 'Alcançou média máxima em uma disciplina', 'star', 'ACADEMICO'),
('Frequência Ouro', '100% de presença no mês', 'check', 'PARTICIPACAO'),
('Primeiros Passos', 'Concluiu a primeira atividade', 'rocket', 'ESPECIAL')
ON CONFLICT DO NOTHING;
