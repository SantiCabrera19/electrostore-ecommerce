-- Arreglar política RLS que causa recursión infinita
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar política problemática
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios datos" ON public.users;

-- 2. Crear nueva política sin recursión
CREATE POLICY "Los usuarios pueden ver sus propios datos" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

-- 3. Crear política separada para admins (sin recursión)
CREATE POLICY "Los admins pueden ver todos los usuarios" 
  ON public.users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 4. Alternativamente, política más simple (recomendada)
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios datos" ON public.users;
DROP POLICY IF EXISTS "Los admins pueden ver todos los usuarios" ON public.users;

CREATE POLICY "Usuarios pueden ver sus datos y admins ven todo" 
  ON public.users FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- 5. Verificar que funciona
SELECT id, email, full_name, role FROM public.users WHERE email = 'santycarrera150@gmail.com';
