-- Adiciona colunas de acessibilidade e diagnóstico à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diagnostico JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS config_a11y JSONB DEFAULT '{}'::jsonb;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.diagnostico IS 'Armazena informações sobre dificuldades e problemas assistivos (ex: { dcd: true, tea: false, motor: "cadeira de rodas" })';
COMMENT ON COLUMN public.profiles.config_a11y IS 'Armazena configurações de acessibilidade do usuário (ex: { highContrast: true, fontScale: 1.2 })';

-- Permissões
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Atualiza a função que trata novos usuários para capturar metadados de diagnóstico
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    nome,
    email,
    role,
    escola,
    turma,
    professor_id,
    diagnostico,
    config_a11y
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'aluno'),
    new.raw_user_meta_data->>'escola',
    new.raw_user_meta_data->>'turma',
    (new.raw_user_meta_data->>'professor_id')::uuid,
    COALESCE((new.raw_user_meta_data->'diagnostico'), '{}'::jsonb),
    COALESCE((new.raw_user_meta_data->'config_a11y'), '{}'::jsonb)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'role', 'aluno')::public.app_role);
  
  RETURN new;
END;
$$;