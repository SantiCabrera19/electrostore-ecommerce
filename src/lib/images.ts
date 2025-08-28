// Utilidades para manejo de imágenes de productos

export interface ProductImages {
  main: string      // Imagen principal para grid/listado
  gallery: string[] // Imágenes adicionales para galería
}

// Mapeo de IDs de productos a sus imágenes
export const PRODUCT_IMAGES: Record<string, ProductImages> = {
  // Refrigerador Samsung 500L
  'ea7a6b3b-2e27-46c9-87cb-6df02189d779': {
    main: '/samsung_refrigerador-500L.png',
    gallery: [
      '/samsung_refrigerador-500L.png',
      '/samsung_refrigerador-500L-2.png', 
      '/samsung_logo.png'
    ]
  },
  // Lavarropas LG 8kg
  '5b9f0932-a897-40ea-ba59-58ecaa889d20': {
    main: '/LG_lavarropas-8kg.png',
    gallery: [
      '/LG_lavarropas-8kg.png',
      '/LG_lavarropas-8kg-1.png',
      '/LG_lavarropas-8kg-2.png',
      '/LG_logo.png'
    ]
  },
  // Microondas Panasonic 25L
  '6fcf32df-c5a2-41e6-8d92-4ce116832a82': {
    main: '/Panasonic_microondas-25L.png',
    gallery: [
      '/Panasonic_microondas-25L.png',
      '/Panasonic_microondas-25L-1.png',
      '/Panasonic_microondas-25L-2.png',
      '/Panasonic_logo.png'
    ]
  },
  // Cocina LG 4 hornallas
  '598d6c8c-3d61-44c4-8754-2bfe8cf89462': {
    main: '/LG_cocina-4-hornallas.png',
    gallery: [
      '/LG_cocina-4-hornallas.png',
      '/LG_cocina-4-hornallas-1.png',
      '/LG_cocina-4-hornallas-2.png',
      '/LG_logo.png'
    ]
  },
  // Heladera Samsung Inverter 300L
  '5faf658f-7f97-4f8e-b411-55bc9c4520c8': {
    main: '/samsung_refriger-inverter-300L.png',
    gallery: [
      '/samsung_refriger-inverter-300L.png',
      '/samsung_refriger-inverter-300L-1.png',
      '/samsung_refriger-inverter-300L-2.png',
      '/samsung_logo.png'
    ]
  },
  // Lavarropas Panasonic 9kg
  '8bda4b82-c6e6-4245-854c-ab438ca24a35': {
    main: '/Panasonic_lavarropas-9kg.png',
    gallery: [
      '/Panasonic_lavarropas-9kg.png',
      '/Panasonic_lavarropas-9kg-1.png',
      '/Panasonic_lavarropas-9kg-2.png',
      '/Panasonic_logo.png'
    ]
  }
}

// Función para obtener imagen principal de un producto
export function getProductMainImage(productId: string, productImages?: string[], mainImage?: string): string {
  // Si hay una imagen principal específica, usarla
  if (mainImage) {
    // Si ya es una URL completa (Supabase Storage), devolverla tal como está
    if (mainImage.startsWith('http')) {
      return mainImage
    }
    // Si es un filename local, agregar la barra
    const cleanImage = mainImage.replace(/^\/+/, '')
    return `/${cleanImage}`
  }
  
  // Si el producto tiene imágenes subidas, usar la primera
  if (productImages && productImages.length > 0) {
    const firstImage = productImages[0]
    // Si ya es una URL completa (Supabase Storage), devolverla tal como está
    if (firstImage.startsWith('http')) {
      return firstImage
    }
    // Si es un filename local, agregar la barra
    const cleanImage = firstImage.replace(/^\/+/, '')
    return `/${cleanImage}`
  }
  
  // Fallback al sistema anterior para productos existentes
  const images = PRODUCT_IMAGES[productId]
  return images?.main || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjlGQUZCIiBzdHJva2U9IiNFNUU3RUIiLz4KPHN2ZyB4PSI3NSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOUNBM0FGIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIi8+Cjwvc3ZnPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FbGVjdHJvU3RvcmU8L3RleHQ+Cjwvc3ZnPgo='
}

// Función para obtener todas las imágenes de galería
export function getProductGallery(productId: string, productImages?: string[]): string[] {
  // Si el producto tiene imágenes subidas, usarlas
  if (productImages && productImages.length > 0) {
    return productImages.map(img => {
      // Si ya es una URL completa (Supabase Storage), devolverla tal como está
      if (img.startsWith('http')) {
        return img
      }
      // Si es un filename local, agregar la barra
      const cleanImage = img.replace(/^\/+/, '')
      return `/${cleanImage}`
    })
  }
  
  // Fallback al sistema anterior para productos existentes
  const images = PRODUCT_IMAGES[productId]
  return images?.gallery || ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjlGQUZCIiBzdHJva2U9IiNFNUU3RUIiLz4KPHN2ZyB4PSI3NSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOUNBM0FGIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIi8+Cjwvc3ZnPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FbGVjdHJvU3RvcmU8L3RleHQ+Cjwvc3ZnPgo=']
}

// Función para obtener todas las imágenes (main + gallery sin duplicados)
export function getAllProductImages(productId: string): string[] {
  const images = PRODUCT_IMAGES[productId]
  if (!images) return ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjlGQUZCIiBzdHJva2U9IiNFNUU3RUIiLz4KPHN2ZyB4PSI3NSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOUNBM0FGIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIi8+Cjwvc3ZnPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FbGVjdHJvU3RvcmU8L3RleHQ+Cjwvc3ZnPgo=']
  
  const allImages = [images.main, ...images.gallery]
  return [...new Set(allImages)] // Eliminar duplicados
}

// Función para verificar si un producto tiene imágenes configuradas
export function hasProductImages(productId: string): boolean {
  return !!PRODUCT_IMAGES[productId]
}
