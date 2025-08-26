# Electro Store - E-Commerce de Electrodomésticos

Un e-commerce full stack construido con Next.js 15, Supabase, y shadcn/ui, inspirado en el estilo de Mercado Libre pero aplicado a una marca propia de electrodomésticos.

## Configuración del Proyecto

### Requisitos Previos

- Node.js 18.x o superior
- Cuenta en [Supabase](https://supabase.com)

### Configuración de Supabase

1. Crea un nuevo proyecto en [Supabase](https://app.supabase.com)
2. Obtén las credenciales de tu proyecto (URL y Anon Key) desde la sección de configuración del proyecto
3. Copia el archivo `.env.local.example` a `.env.local` y actualiza las variables con tus credenciales:

```
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
```

4. Ejecuta el script SQL en la sección SQL Editor de Supabase para crear las tablas necesarias (ver `/supabase/schema.sql`)

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Características del MVP

- Home / catálogo de productos con filtros
- Vista detallada de producto
- Carrito de compras (agregar, eliminar, editar cantidades)
- Checkout simulado
- Generación de orden en Supabase
- Pantalla de confirmación de orden

## Estructura del Proyecto

```
ecommerce-app/
│── .env.local
│── package.json
│── tailwind.config.ts
│
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx (Home)
    │   ├── (auth)/
    │   ├── (store)/       # Parte pública e-commerce
    │   ├── (dashboard)/   # Panel admin
    │   └── api/           # Endpoints (checkout, webhooks)
    │
    ├── components/        # Componentes reutilizables
    │   ├── ui/            # De shadcn y v0
    │   ├── layout/        # Navbar, Footer, etc.
    │   └── forms/         # Formularios reutilizables
    │
    ├── lib/               # Helpers y config
    │   ├── supabase.ts
    │   ├── auth.ts
    │   └── utils.ts
    │
    ├── hooks/             # Hooks de React
    ├── context/           # Contextos globales (ej. carrito)
    ├── styles/            # globals.css
    └── types/             # Tipos TypeScript
```

## Tecnologías Utilizadas

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Futuro**: Integración con Stripe o MercadoPago para pagos reales
