-- Script para hacer admin al usuario actual
-- Ejecutar en Supabase SQL Editor

-- Buscar tu usuario por email
SELECT id, email, full_name, role FROM users WHERE email = 'santycarrera150@gmail.com';

-- Hacer admin al usuario (reemplaza el email si es diferente)
UPDATE users 
SET role = 'admin' 
WHERE email = 'santycarrera150@gmail.com';

-- Verificar el cambio
SELECT id, email, full_name, role FROM users WHERE email = 'santycarrera150@gmail.com';
