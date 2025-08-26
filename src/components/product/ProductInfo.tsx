"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { addToCart } from "@/lib/cart"

interface ProductInfoProps {
  product: any
  categoryName?: string
}

function formatPrice(value: number) {
  return value.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
}

export default function ProductInfo({ product, categoryName }: ProductInfoProps) {
  const specs = (product.specs ?? {}) as Record<string, unknown>
  const originalPrice = typeof specs["original_price"] === "number" ? specs["original_price"] : undefined
  const installments = typeof specs["installments"] === "string" ? specs["installments"] : undefined
  const discount = originalPrice && originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    addToCart(product.id)
  }

  return (
    <div className="lg:sticky lg:top-24 self-start space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground leading-tight">{product.name}</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {originalPrice && originalPrice > product.price && (
          <span className="text-sm sm:text-base text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
          {discount > 0 && <Badge className="bg-accent text-accent-foreground text-xs">{discount}% OFF</Badge>}
        </div>
      </div>

      {installments && (
        <div className="text-sm text-muted-foreground">Precio en cuotas: {installments}</div>
      )}

      {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="btn-primary flex-1 sm:min-w-48" onClick={handleAddToCart}>
          Agregar al carrito
        </Button>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="secondary" className="btn-secondary flex-1 sm:flex-none">Favorito</Button>
          <Button variant="secondary" className="btn-secondary flex-1 sm:flex-none">Compartir</Button>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="font-medium text-foreground mb-2 text-sm sm:text-base">¡Promos bancarias!</div>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>12 cuotas sin interés</li>
            <li>18 cuotas con interés bajo</li>
            <li>Transferencia con 10% OFF</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
