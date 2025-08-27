'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { formatPrice } from '@/utils/formatters'
import type { Product, Category } from '@/hooks/useProducts'

interface ProductListProps {
  products: Product[]
  categories: Category[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onView: (productSlug: string) => void
}

export default function ProductList({ 
  products, 
  categories, 
  onEdit, 
  onDelete, 
  onView 
}: ProductListProps) {
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Sin categoría'
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoría desconocida'
  }

  const getDiscountPercentage = (price: number, compareAtPrice: any) => {
    if (!compareAtPrice || compareAtPrice <= price) return null
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No hay productos creados aún.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => {
            const compareAtPrice = (product as any).compare_at_price
            const discountPercentage = getDiscountPercentage(product.price, compareAtPrice)
            
            return (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg truncate">{product.name}</h3>
                      {discountPercentage && (
                        <Badge variant="destructive" className="text-xs">
                          -{discountPercentage}%
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>Categoría: {getCategoryName(product.category_id)}</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {compareAtPrice && compareAtPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(compareAtPrice)}
                        </span>
                      )}
                    </div>
                    
                    {product.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(product.slug || product.id)}
                      title="Ver producto"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                      title="Editar producto"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                          onDelete(product.id)
                        }
                      }}
                      title="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
