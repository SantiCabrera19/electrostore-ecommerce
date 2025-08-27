-- EJECUTAR ESTE SCRIPT EN EL PANEL DE SUPABASE
-- Ve a: Dashboard > SQL Editor > New Query
-- Copia y pega este código, luego haz clic en "Run"

-- Add customer data fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_city TEXT,
ADD COLUMN IF NOT EXISTS customer_province TEXT,
ADD COLUMN IF NOT EXISTS customer_postal_code TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;
