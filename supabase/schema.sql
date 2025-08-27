-- Esquema para la base de datos de Electro Store

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin'))
);

-- Trigger para crear un registro en users cuando se crea un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de marcas
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2), 
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}',
  main_image TEXT,
  specs JSONB NOT NULL DEFAULT '{}',
  slug TEXT UNIQUE, 
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total NUMERIC(10, 2) NOT NULL,
  -- Datos del cliente para facturación
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_province TEXT NOT NULL,
  customer_postal_code TEXT NOT NULL,
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de items de órdenes
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Políticas de seguridad (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden ver sus propios datos" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Los usuarios pueden actualizar sus propios datos" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Políticas para categorías
CREATE POLICY "Cualquiera puede ver categorías" 
  ON public.categories FOR SELECT 
  USING (true);

CREATE POLICY "Solo administradores pueden modificar categorías" 
  ON public.categories FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para marcas
CREATE POLICY "Cualquiera puede ver marcas" 
  ON public.brands FOR SELECT 
  USING (true);

CREATE POLICY "Solo administradores pueden modificar marcas" 
  ON public.brands FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para productos
CREATE POLICY "Cualquiera puede ver productos" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Solo administradores pueden modificar productos" 
  ON public.products FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para órdenes
CREATE POLICY "Los usuarios pueden ver sus propias órdenes" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Los usuarios pueden crear sus propias órdenes" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo administradores pueden actualizar órdenes" 
  ON public.orders FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para items de órdenes
CREATE POLICY "Los usuarios pueden ver sus propios items de órdenes" 
  ON public.order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Los usuarios pueden crear sus propios items de órdenes" 
  ON public.order_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Datos de ejemplo

-- Insertar categorías de ejemplo
INSERT INTO public.categories (name, description) VALUES
('Refrigeración', 'Heladeras, freezers y aires acondicionados'),
('Cocina', 'Cocinas, hornos y microondas'),
('Lavado', 'Lavarropas y lavavajillas'),
('Pequeños electrodomésticos', 'Cafeteras, tostadoras y más'),
('Televisores', 'Smart TV y accesorios');

-- Insertar marcas de ejemplo
INSERT INTO public.brands (name) VALUES
('ElectroHogar'),
('TechHome'),
('CoolTech'),
('HomeAppliances'),
('SmartLiving');

-- Insertar productos de ejemplo
INSERT INTO public.products (name, description, price, stock, specs, category_id, brand_id) VALUES
(
  'Heladera No Frost 300L', 
  'Heladera con freezer superior, tecnología no frost y control de temperatura digital', 
  150000, 
  10, 
  '{"color": "Plateado", "dimensiones": "60x65x180cm", "eficiencia_energética": "A++", "capacidad": "300L"}', 
  (SELECT id FROM public.categories WHERE name = 'Refrigeración'), 
  (SELECT id FROM public.brands WHERE name = 'ElectroHogar')
),
(
  'Lavarropas Automático 8kg', 
  'Lavarropas de carga frontal con múltiples programas de lavado y centrifugado', 
  120000, 
  15, 
  '{"color": "Blanco", "dimensiones": "60x60x85cm", "capacidad": "8kg", "velocidad_centrifugado": "1200rpm"}', 
  (SELECT id FROM public.categories WHERE name = 'Lavado'), 
  (SELECT id FROM public.brands WHERE name = 'TechHome')
),
(
  'Smart TV 55" 4K', 
  'Televisor LED con resolución 4K, sistema operativo Android TV y control por voz', 
  200000, 
  8, 
  '{"resolución": "3840x2160", "sistema_operativo": "Android TV", "conectividad": ["WiFi", "Bluetooth", "HDMI x3", "USB x2"], "sonido": "Dolby Atmos"}', 
  (SELECT id FROM public.categories WHERE name = 'Televisores'), 
  (SELECT id FROM public.brands WHERE name = 'SmartLiving')
);