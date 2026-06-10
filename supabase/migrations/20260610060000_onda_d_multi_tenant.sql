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
