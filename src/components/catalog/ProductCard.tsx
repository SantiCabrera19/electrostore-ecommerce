"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
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
  const image = getProductMainImage(product.id, product.images as string[], product.main_image)
  const specs = (product.specs ?? {}) as Record<string, unknown>
  
  const compareAtPrice = product.compare_at_price
  const installments = typeof specs["installments"] === "string" ? specs["installments"] : undefined
  const hasOffer = compareAtPrice && compareAtPrice > product.price
  const discountPercentage = hasOffer ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100) : 0

  const handleAddToCart = async () => {
    const { addToCart } = await import('@/lib/cart')
    addToCart(product.id)
  }

  const mainImageUrl = image || '/placeholder-product.jpg'

  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {hasOffer && (
          <Badge className="absolute top-1 left-1 lg:top-2 lg:left-2 z-10 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs lg:text-sm">
            -{discountPercentage}%
          </Badge>
        )}
        
        <Link href={`/products/${product.slug}`}>
          <div className="relative w-full h-full">
            <Image
              src={mainImageUrl}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
            />
          </div>
        </Link>
      </div>

      <CardContent className="p-2 lg:p-4">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-semibold text-foreground mb-1 lg:mb-2 line-clamp-2 group-hover:text-primary transition-colors text-xs lg:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="space-y-1 lg:space-y-2">
          {hasOffer && (
            <div className="flex items-center gap-1 lg:gap-2">
              <span className="text-xs lg:text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </span>
              <Badge variant="destructive" className="text-xs">
                -{discountPercentage}%
              </Badge>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1 lg:gap-0">
            <span className="text-sm lg:text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs lg:text-sm h-6 lg:h-8 px-2 lg:px-3" onClick={handleAddToCart}>
              <ShoppingCart className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
              <span className="hidden lg:inline">Agregar</span>
              <span className="lg:hidden">+</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
