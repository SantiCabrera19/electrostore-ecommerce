'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Package, DollarSign, Eye, EyeOff } from 'lucide-react'
import { getProductMainImage } from '@/lib/images'
import type { Database } from '@/types/supabase'

type Product = Database["public"]["Tables"]["products"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"]

interface ProductCardProps {
  product: Product
  categories: Category[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleVisibility: (id: string, isVisible: boolean) => void
}

export default function ProductCard({
  product,
  categories,
  onEdit,
  onDelete,
  onToggleVisibility
}: ProductCardProps) {
  const category = categories.find((cat: Category) => cat.id === product.category_id)
  const mainImage = getProductMainImage(product.id, product.images, product.main_image || product.thumbnail_url || undefined)
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercentage = hasDiscount && product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!product.active && (
              <Badge variant="secondary" className="text-xs">
                <EyeOff className="h-3 w-3 mr-1" />
                Oculto
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="destructive" className="text-xs">
                Sin Stock
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="default" className="text-xs bg-green-600">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Stock indicator */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
              className="text-xs"
            >
              Stock: {product.stock}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Category */}
          <div>
            <CardTitle className="text-lg line-clamp-2 mb-1">
              {product.name}
            </CardTitle>
            {category && (
              <Badge variant="outline" className="text-xs">
                {category.name}
              </Badge>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold text-lg">
                ${product.price.toLocaleString()}
              </span>
            </div>
            {hasDiscount && product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Specifications Preview */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Specs:</span> {Object.keys(product.specs).length} características
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleVisibility(product.id, !product.active)}
              className="px-3"
            >
              {product.active ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="px-3"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
