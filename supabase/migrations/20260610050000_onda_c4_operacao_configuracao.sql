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
