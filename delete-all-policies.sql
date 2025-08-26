-- Eliminar TODAS las políticas problemáticas de la tabla users
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Acceso básico a usuarios" ON public.users;
DROP POLICY IF EXISTS "users_select_propio_o_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_propio" ON public.users;

-- 2. Crear política simple para SELECT (lectura)
CREATE POLICY "users_select_simple" 
  ON public.users FOR SELECT 
  USING (true);

-- 3. Crear política simple para UPDATE (actualización)
CREATE POLICY "users_update_simple" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- 4. Verificar que funciona
SELECT id, email, full_name, role FROM public.users WHERE email = 'santycarrera150@gmail.com';
