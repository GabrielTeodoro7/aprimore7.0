
-- ============================================================
-- ONDA A — Núcleo educacional
-- ============================================================

-- 1) Função reutilizável de validação de CPF (algoritmo oficial)
CREATE OR REPLACE FUNCTION public.is_valid_cpf(_cpf text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  d text;
  s int;
  i int;
  r int;
  d1 int;
  d2 int;
BEGIN
  IF _cpf IS NULL OR length(trim(_cpf)) = 0 THEN
    RETURN true; -- opcional
  END IF;
  d := regexp_replace(_cpf, '\D', '', 'g');
  IF length(d) <> 11 THEN RETURN false; END IF;
  IF d ~ '^(\d)\1{10}$' THEN RETURN false; END IF;

  s := 0;
  FOR i IN 1..9 LOOP
    s := s + (substr(d, i, 1))::int * (11 - i);
  END LOOP;
  r := (s * 10) % 11;
  d1 := CASE WHEN r = 10 THEN 0 ELSE r END;
  IF d1 <> (substr(d, 10, 1))::int THEN RETURN false; END IF;

  s := 0;
  FOR i IN 1..10 LOOP
    s := s + (substr(d, i, 1))::int * (12 - i);
  END LOOP;
  r := (s * 10) % 11;
  d2 := CASE WHEN r = 10 THEN 0 ELSE r END;
  RETURN d2 = (substr(d, 11, 1))::int;
END;
$$;

-- 2) ALUNOS: coluna cpf opcional, única, validada
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS cpf text;
DO $$ BEGIN
  ALTER TABLE public.alunos ADD CONSTRAINT alunos_cpf_valido CHECK (public.is_valid_cpf(cpf));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS alunos_cpf_unique
  ON public.alunos (regexp_replace(cpf, '\D', '', 'g'))
  WHERE cpf IS NOT NULL;

-- 3) TURMAS: capacidade + trigger
ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS capacidade integer NOT NULL DEFAULT 30;
DO $$ BEGIN
  ALTER TABLE public.turmas ADD CONSTRAINT turmas_capacidade_positiva CHECK (capacidade > 0 AND capacidade <= 200);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.check_turma_capacidade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cap int;
  qtd int;
BEGIN
  SELECT capacidade INTO cap FROM public.turmas WHERE id = NEW.turma_id;
  IF cap IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO qtd FROM public.alunos
    WHERE turma_id = NEW.turma_id
      AND (TG_OP = 'INSERT' OR id <> NEW.id);
  IF qtd >= cap THEN
    RAISE EXCEPTION 'Turma % atingiu a capacidade máxima (%).', NEW.turma_id, cap
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_turma_capacidade ON public.alunos;
CREATE TRIGGER trg_check_turma_capacidade
  BEFORE INSERT OR UPDATE OF turma_id ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION public.check_turma_capacidade();

-- 4) FREQUENCIA: data válida
DO $$ BEGIN
  ALTER TABLE public.frequencia ADD CONSTRAINT frequencia_data_valida
    CHECK (data >= DATE '2000-01-01' AND data <= CURRENT_DATE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5) AVALIACOES: faixa de nota, peso, data
DO $$ BEGIN
  ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_media_range
    CHECK (media IS NULL OR (media >= 0 AND media <= 10));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_peso_range
    CHECK (peso >= 1 AND peso <= 10);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_data_nao_futura
    CHECK (data IS NULL OR data <= CURRENT_DATE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6) SUBMISSOES: nota e status
DO $$ BEGIN
  ALTER TABLE public.submissoes ADD CONSTRAINT submissoes_nota_range
    CHECK (nota IS NULL OR (nota >= 0 AND nota <= 10));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.submissoes ADD CONSTRAINT submissoes_status_valido
    CHECK (status IN ('pendente','entregue','corrigida','atrasada'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7) AUDIT_LOGS: imutável (sem UPDATE/DELETE)
CREATE OR REPLACE FUNCTION public.block_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs é imutável: % não permitido.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.block_audit_mutation();

REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated, anon;
