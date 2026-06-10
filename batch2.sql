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
-- Migration M15, M16, M17, M18, M19: Operação e Configuração
-- O QUE: Tabelas para feriados, limites de plano, API keys, jobs de relatório e métricas.
-- POR QUE: Cumprimento de RN.29, RN.30, RN.33, RN.38, RN.40 e RN.44.

-- RN.29: Feriados
CREATE TABLE IF NOT EXISTS feriados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    data DATE NOT NULL,
    tipo TEXT CHECK (tipo IN ('FIXO', 'VARIAVEL', 'FACULTATIVO')),
    UNIQUE(data, nome)
);

-- RN.30: Limites de Plano
CREATE TABLE IF NOT EXISTS limites_plano (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurso TEXT NOT NULL,
    limite_max INTEGER NOT NULL,
    uso_atual INTEGER DEFAULT 0,
    UNIQUE(recurso)
);

-- Função helper para verificar limite
CREATE OR REPLACE FUNCTION pode_criar(p_recurso TEXT) RETURNS BOOLEAN AS $$
DECLARE
    v_limite INTEGER;
    v_uso INTEGER;
BEGIN
    SELECT limite_max, uso_atual INTO v_limite, v_uso FROM limites_plano WHERE recurso = p_recurso;
    IF NOT FOUND THEN RETURN TRUE; END IF;
    RETURN v_uso < v_limite;
END;
$$ LANGUAGE plpgsql;

-- RN.33: API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE,
    escopo TEXT NOT NULL DEFAULT 'READ_ONLY',
    expira_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RN.38, 40: Relatórios Assíncronos (Fila)
CREATE TABLE IF NOT EXISTS relatorios_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    tipo_relatorio TEXT NOT NULL,
    formato TEXT NOT NULL CHECK (formato IN ('PDF', 'CSV', 'XLSX')),
    status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'ERRO')),
    arquivo_url TEXT,
    erro_mensagem TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    finished_at TIMESTAMPTZ
);

-- RN.44: Métricas de Saúde (SLA)
CREATE TABLE IF NOT EXISTS metricas_saude (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS Básico
ALTER TABLE feriados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de feriados" ON feriados FOR SELECT USING (true);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam suas API keys" ON api_keys FOR ALL USING (auth.uid() = user_id);

ALTER TABLE relatorios_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem seus próprios jobs" ON relatorios_jobs FOR SELECT USING (auth.uid() = user_id);

-- Comentários didáticos
COMMENT ON TABLE feriados IS 'Cadastro de feriados e dias não letivos (RN.29)';
COMMENT ON TABLE limites_plano IS 'Controle de quotas e limites por recurso (RN.30)';
COMMENT ON TABLE api_keys IS 'Chaves de acesso programático (RN.33)';
COMMENT ON TABLE relatorios_jobs IS 'Fila de processamento assíncrono de relatórios pesados (RN.38)';
