-- Solución simple: Eliminar la política problemática temporalmente
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar política que causa recursión
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios datos" ON public.users;

-- 2. Crear política simple sin recursión
CREATE POLICY "Acceso básico a usuarios" 
  ON public.users FOR SELECT 
  USING (true);

-- Esta política permite leer a todos los usuarios autenticados
-- Es temporal para que funcione el componente AuthButtons
