-- =============================================================================
-- Onda C — C.1 — Migration M4: Domínios institucionais (RN.35)
-- -----------------------------------------------------------------------------
-- Restringe cadastro a domínios autorizados quando `obrigatorio = true`.
-- Lista vazia ou todos com `obrigatorio = false` → cadastro continua aberto
-- (compatibilidade com usuários já cadastrados em outros domínios).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.dominios_institucionais (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dominio      TEXT NOT NULL UNIQUE,            -- ex.: 'escola.edu.br'
  descricao    TEXT,
  obrigatorio  BOOLEAN NOT NULL DEFAULT false,
  ativo        BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.dominios_institucionais TO authenticated;
GRANT SELECT ON public.dominios_institucionais TO anon;  -- usado no signup (anon)
GRANT ALL    ON public.dominios_institucionais TO service_role;
ALTER TABLE public.dominios_institucionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dominios_read_all"
  ON public.dominios_institucionais FOR SELECT
  USING (ativo = true);

CREATE POLICY "dominios_admin_manage"
  ON public.dominios_institucionais FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Função utilitária: retorna true se o e-mail é aceitável.
CREATE OR REPLACE FUNCTION public.dominio_email_permitido(_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_dominio TEXT := lower(split_part(_email, '@', 2));
  v_obrig   BOOLEAN;
BEGIN
  IF v_dominio = '' THEN RETURN false; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.dominios_institucionais
    WHERE ativo AND obrigatorio
  ) INTO v_obrig;

  IF NOT v_obrig THEN
    RETURN true;   -- sem domínios obrigatórios → tudo permitido
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.dominios_institucionais
    WHERE ativo AND lower(dominio) = v_dominio
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.dominio_email_permitido(TEXT) TO anon, authenticated;
