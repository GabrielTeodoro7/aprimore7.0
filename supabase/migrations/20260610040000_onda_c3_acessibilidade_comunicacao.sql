-- Migration M12, M13, M14: Acessibilidade e Comunicação
-- O QUE: Tabelas para preferências de acessibilidade, pranchas de comunicação e moderação.
-- POR QUE: Cumprimento de RN.24, RN.25, RN.26 e RN.37.

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

-- RLS para acessibilidade
ALTER TABLE preferencias_acessibilidade ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem ver suas próprias preferências') THEN
        CREATE POLICY "Usuários podem ver suas próprias preferências"
            ON preferencias_acessibilidade FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem atualizar suas próprias preferências') THEN
        CREATE POLICY "Usuários podem atualizar suas próprias preferências"
            ON preferencias_acessibilidade FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem inserir suas próprias preferências') THEN
        CREATE POLICY "Usuários podem inserir suas próprias preferências"
            ON preferencias_acessibilidade FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- RN.24: Pranchas de Comunicação (Personalização)
CREATE TABLE IF NOT EXISTS pranchas_comunicacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    layout_json JSONB NOT NULL DEFAULT '{}',
    favorita BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para pranchas
ALTER TABLE pranchas_comunicacao ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários gerenciam suas próprias pranchas') THEN
        CREATE POLICY "Usuários gerenciam suas próprias pranchas"
            ON pranchas_comunicacao FOR ALL
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- RN.25: Moderação de Mensagens
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

-- RLS para denúncias
ALTER TABLE denuncias_mensagem ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Denunciantes podem ver suas próprias denúncias') THEN
        CREATE POLICY "Denunciantes podem ver suas próprias denúncias"
            ON denuncias_mensagem FOR SELECT
            USING (auth.uid() = denunciante_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Apenas moderadores e admins veem todas as denúncias') THEN
        CREATE POLICY "Apenas moderadores e admins veem todas as denúncias"
            ON denuncias_mensagem FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('ADMIN', 'CEO', 'MODERADOR')
                )
            );
    END IF;
END $$;

-- RN.26: Notificações com Retry Exponencial
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    titulo TEXT,
    mensagem TEXT,
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notificacoes' AND COLUMN_NAME = 'canal_preferido') THEN
        ALTER TABLE notificacoes ADD COLUMN canal_preferido TEXT DEFAULT 'EMAIL';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notificacoes' AND COLUMN_NAME = 'tentativas') THEN
        ALTER TABLE notificacoes ADD COLUMN tentativas INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notificacoes' AND COLUMN_NAME = 'proxima_tentativa') THEN
        ALTER TABLE notificacoes ADD COLUMN proxima_tentativa TIMESTAMPTZ DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notificacoes' AND COLUMN_NAME = 'status_entrega') THEN
        ALTER TABLE notificacoes ADD COLUMN status_entrega TEXT DEFAULT 'PENDENTE';
    END IF;
END $$;

COMMENT ON TABLE preferencias_acessibilidade IS 'Preferências de acessibilidade sincronizadas (RN.37)';
COMMENT ON TABLE pranchas_comunicacao IS 'Pranchas de comunicação personalizadas para inclusão (RN.24)';
COMMENT ON TABLE denuncias_mensagem IS 'Registro de denúncias para moderação de conteúdo (RN.25)';
