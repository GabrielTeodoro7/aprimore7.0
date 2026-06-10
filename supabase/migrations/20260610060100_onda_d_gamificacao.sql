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
