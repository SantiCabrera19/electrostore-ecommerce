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
  const image = getProductMainImage(product.id)
  const specs = (product.specs ?? {}) as Record<string, unknown>
  
  const originalPrice = typeof specs["original_price"] === "number" ? specs["original_price"] : undefined
  const installments = typeof specs["installments"] === "string" ? specs["installments"] : undefined
  const hasOffer = (typeof specs["has_offer"] === "boolean" && specs["has_offer"]) ||
    (originalPrice && originalPrice > product.price) || false

  const handleAddToCart = async () => {
    const { addToCart } = await import('@/lib/cart')
    addToCart(product.id)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border">
      <CardContent className="p-0">
        <div className="relative">
          <Link href={`/store/${slug}?id=${product.id}`}>
            <img
              src={image}
              alt={product.name}
              className="w-full h-64 object-contain bg-gray-50 rounded-t-lg p-4"
            />
          </Link>
          {hasOffer && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
              Oferta
            </Badge>
          )}
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
            <Link href={`/store/${slug}?id=${product.id}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          {product.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="mb-4">
            {originalPrice && originalPrice > product.price && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </p>
            )}
            <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
            {installments && (
              <p className="text-sm text-muted-foreground">{installments}</p>
            )}
          </div>

          <Button className="btn-primary w-full" onClick={handleAddToCart}>
            Agregar al carrito
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
