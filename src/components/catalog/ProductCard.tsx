"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getProductMainImage } from "@/lib/images"
import type { Tables } from '@/types/supabase'

type Product = Tables<'products'>

interface ProductCardProps {
  product: Product
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function ProductCard({ product }: ProductCardProps) {
  const slug = toSlug(product.name)
  const image = getProductMainImage(product.id, product.images as string[], (product as any).main_image)
  const specs = (product.specs ?? {}) as Record<string, unknown>
  
  const compareAtPrice = (product as any).compare_at_price
  const installments = typeof specs["installments"] === "string" ? specs["installments"] : undefined
  const hasOffer = compareAtPrice && compareAtPrice > product.price
  const discountPercentage = hasOffer ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100) : 0

  const handleAddToCart = async () => {
    const { addToCart } = await import('@/lib/cart')
    addToCart(product.id)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="relative">
          <Link href={`/store/${slug}?id=${product.id}`}>
            <img
              src={image}
              alt={product.name}
              className="w-full h-48 sm:h-56 lg:h-64 object-contain bg-gray-50 rounded-t-lg p-3 sm:p-4"
            />
          </Link>
          {hasOffer && (
            <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-xs font-semibold">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        <div className="p-4 sm:p-6 flex flex-col flex-grow">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm sm:text-base">
            <Link href={`/store/${slug}?id=${product.id}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          {product.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 flex-grow">
              {product.description}
            </p>
          )}

          <div className="mb-3 sm:mb-4 mt-auto">
            {hasOffer && (
              <p className="text-xs sm:text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </p>
            )}
            <p className="text-lg sm:text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
            {installments && (
              <p className="text-xs sm:text-sm text-muted-foreground">{installments}</p>
            )}
          </div>

          <Button className="btn-primary w-full text-sm sm:text-base py-2 sm:py-3" onClick={handleAddToCart}>
            Agregar al carrito
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
