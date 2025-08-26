// Utilidades para el sistema de ofertas
import type { Tables } from '@/types/supabase'

type Product = Tables<'products'>

export interface OfferInfo {
  hasOffer: boolean
  originalPrice: number | null
  currentPrice: number
  discountPercentage: number
  savings: number
}

/**
 * Calcula información de oferta para un producto
 */
export function calculateOffer(product: Product): OfferInfo {
  const compareAtPrice = (product as any).compare_at_price
  const currentPrice = product.price
  
  const hasOffer = compareAtPrice && compareAtPrice > currentPrice
  const discountPercentage = hasOffer 
    ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
    : 0
  const savings = hasOffer ? compareAtPrice - currentPrice : 0

  return {
    hasOffer: Boolean(hasOffer),
    originalPrice: compareAtPrice || null,
    currentPrice,
    discountPercentage,
    savings
  }
}

/**
 * Formatea precio en pesos argentinos
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

/**
 * Filtra productos que están en oferta
 */
export function getProductsOnSale(products: Product[]): Product[] {
  return products.filter(product => {
    const offer = calculateOffer(product)
    return offer.hasOffer
  })
}

/**
 * Ordena productos por mayor descuento
 */
export function sortByDiscount(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const offerA = calculateOffer(a)
    const offerB = calculateOffer(b)
    return offerB.discountPercentage - offerA.discountPercentage
  })
}
