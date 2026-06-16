
-- 1) Revoga EXECUTE público em TODAS as funções SECURITY DEFINER do schema public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_ceo(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_aluno_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_professor_of_turma(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_demo_user(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_profile_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.senha_precisa_trocar(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.dominio_email_permitido(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_valid_cpf(text) FROM PUBLIC, anon;

-- Concede só ao papel necessário (authenticated p/ uso em RLS + service_role p/ servidor)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_ceo(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_aluno_owner(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_professor_of_turma(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_demo_user(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.senha_precisa_trocar(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.dominio_email_permitido(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_valid_cpf(text) TO authenticated, service_role;

-- 2) Funções de trigger / internas: ninguém precisa chamar via API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_turma_capacidade() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.soft_delete_intercept() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.block_audit_mutation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 3) Política "always true" em tentativas_login: já é TO service_role, mas tornamos explícito
DROP POLICY IF EXISTS tentativas_service_insert ON public.tentativas_login;
CREATE POLICY tentativas_service_insert ON public.tentativas_login
  FOR INSERT TO service_role
  WITH CHECK (current_setting('role', true) = 'service_role');
