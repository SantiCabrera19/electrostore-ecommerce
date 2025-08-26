-- Solución completa: Eliminar todas las políticas y deshabilitar RLS temporalmente
-- Ejecutar en Supabase SQL Editor

-- 1. Deshabilitar RLS en la tabla users (solución temporal)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Acceso básico a usuarios" ON public.users;
DROP POLICY IF EXISTS "users_select_propio_o_admin" ON public.users;  
DROP POLICY IF EXISTS "users_update_propio" ON public.users;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios datos" ON public.users;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios datos" ON public.users;

-- 3. Verificar que funciona
SELECT id, email, full_name, role FROM public.users WHERE email = 'santycarrera150@gmail.com';

-- NOTA: Esto deshabilita la seguridad a nivel de fila temporalmente
-- Una vez que funcione, podemos crear políticas más simples
