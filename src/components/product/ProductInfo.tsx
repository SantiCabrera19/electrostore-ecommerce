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
    <div className="lg:sticky lg:top-24 self-start">
      <h1 className="text-3xl font-semibold text-foreground mb-2">{product.name}</h1>

      <div className="flex items-center gap-3 mb-4">
        {originalPrice && originalPrice > product.price && (
          <span className="text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
        )}
        <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
        {discount > 0 && <Badge className="bg-accent text-accent-foreground">{discount}% OFF</Badge>}
      </div>

      {installments && (
        <div className="text-sm text-muted-foreground mb-4">Precio en cuotas: {installments}</div>
      )}

      <div className="flex gap-3 mb-6">
        <Button className="btn-primary min-w-48" onClick={handleAddToCart}>
          Agregar al carrito
        </Button>
        <Button variant="secondary" className="btn-secondary">Favorito</Button>
        <Button variant="secondary" className="btn-secondary">Compartir</Button>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="font-medium text-foreground mb-2">¡Promos bancarias!</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>12 cuotas sin interés</li>
            <li>18 cuotas con interés bajo</li>
            <li>Transferencia con 10% OFF</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
