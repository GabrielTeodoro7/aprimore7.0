-- Adiciona WhatsApp ao perfil se não existir
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Tabela para contatos externos (pais, responsáveis)
CREATE TABLE IF NOT EXISTS public.contatos_externos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    parentesco TEXT, -- Ex: Pai, Mãe, Tutor
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contatos_externos TO authenticated;
GRANT ALL ON public.contatos_externos TO service_role;

-- RLS
ALTER TABLE public.contatos_externos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores gerenciam seus contatos externos"
ON public.contatos_externos FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professor_id))
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = professor_id));
