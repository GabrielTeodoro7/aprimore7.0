-- 1) search_path imutável nas funções restantes
ALTER FUNCTION public.is_valid_cpf(text) SET search_path = public;
ALTER FUNCTION public.block_audit_mutation() SET search_path = public;

-- 2) Remove a política permissiva e recria restrita ao service_role
DROP POLICY IF EXISTS tentativas_anon_insert_via_service ON public.tentativas_login;

CREATE POLICY tentativas_service_insert
  ON public.tentativas_login
  FOR INSERT
  TO service_role
  WITH CHECK (true);
