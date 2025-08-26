-- Debug script para verificar el estado del usuario
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar usuarios en auth.users
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'santycarrera150@gmail.com';

-- 2. Verificar usuarios en public.users
SELECT id, email, full_name, role FROM public.users WHERE email = 'santycarrera150@gmail.com';

-- 3. Si no existe en public.users, crearlo manualmente
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'full_name', 'admin'
FROM auth.users 
WHERE email = 'santycarrera150@gmail.com'
AND NOT EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.users.id);

-- 4. Actualizar role a admin si ya existe
UPDATE public.users 
SET role = 'admin', full_name = 'Santiago Cabrera'
WHERE email = 'santycarrera150@gmail.com';

-- 5. Verificar resultado final
SELECT id, email, full_name, role FROM public.users WHERE email = 'santycarrera150@gmail.com';
