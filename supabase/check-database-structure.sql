-- Consulta para ver todas las tablas y su estructura
-- Útil para evaluar si la BD está preparada para sistema de ofertas

-- 1. Ver todas las tablas en el esquema public
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Ver estructura de la tabla products (más relevante para ofertas)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- 3. Ver todas las columnas de todas las tablas
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;
