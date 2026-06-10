-- Reset passwords for demo accounts so the demo buttons work
UPDATE auth.users
SET encrypted_password = crypt('admin123', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'admin@escola.com';

UPDATE auth.users
SET encrypted_password = crypt('ana123', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'ana@escola.com';

UPDATE auth.users
SET encrypted_password = crypt('joao123', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'joao@escola.com';

-- Ensure the three are flagged as demo (read-only at RLS level too)
UPDATE public.profiles SET is_demo = true
WHERE email IN ('admin@escola.com', 'ana@escola.com', 'joao@escola.com');
