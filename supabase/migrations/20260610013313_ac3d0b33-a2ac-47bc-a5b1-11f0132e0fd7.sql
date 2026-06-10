-- =========================================================
-- ENUM de papéis (CEO incluso desde o início)
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('ceo', 'admin', 'professor', 'aluno');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'aluno',
  escola TEXT,
  professor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  turma TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  ultimo_acesso TIMESTAMPTZ,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  cargo TEXT,
  ano TEXT,
  theme TEXT NOT NULL DEFAULT 'light',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_professor_id ON public.profiles(professor_id);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role = _role OR role = 'ceo')
  );
$$;

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_ceo(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'ceo');
$$;

CREATE OR REPLACE FUNCTION public.is_demo_user(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_demo FROM public.profiles WHERE user_id = _user_id LIMIT 1), false);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_nome   TEXT := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_role   public.app_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'aluno');
  v_escola TEXT := NEW.raw_user_meta_data->>'escola';
  v_turma  TEXT := NEW.raw_user_meta_data->>'turma';
  v_prof   UUID := NULLIF(NEW.raw_user_meta_data->>'professor_id', '')::UUID;
BEGIN
  INSERT INTO public.profiles (user_id, nome, email, role, escola, turma, professor_id)
  VALUES (NEW.id, v_nome, NEW.email, v_role, v_escola, v_turma, v_prof)
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.current_profile_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_ceo(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_ceo(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_demo_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_demo_user(UUID) TO authenticated;
