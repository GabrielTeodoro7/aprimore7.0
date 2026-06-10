-- Adiciona coluna para armazenar URLs dos arquivos na tabela de atividades
ALTER TABLE public.atividades ADD COLUMN IF NOT EXISTS arquivos TEXT[] DEFAULT '{}';

-- Políticas de acesso ao bucket
CREATE POLICY "Professores podem gerenciar anexos de suas atividades"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'atividades-anexos')
WITH CHECK (bucket_id = 'atividades-anexos');

CREATE POLICY "Acesso público aos anexos de atividades"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'atividades-anexos');
