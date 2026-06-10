ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_streak_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS frequencia_acumulada DECIMAL(5,2) DEFAULT 100.00;

-- Grant permissions (already should be there, but good practice)
GRANT ALL ON public.alunos TO authenticated;
GRANT ALL ON public.alunos TO service_role;
