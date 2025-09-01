'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus } from 'lucide-react'
import ImageUploader from '@/components/forms/ImageUploader'
import type { Product, Category } from '@/hooks/useProducts'

export interface ProductFormData {
  name: string
  price: string
  compare_at_price: string
  description: string
  stock: string
  category_id: string
  images: string[]
  main_image: string
  specs: Record<string, string>
}

interface ProductFormProps {
  formData: ProductFormData
  categories: Category[]
  editingProduct: Product | null
  onSubmit: (e: React.FormEvent) => void
  onInputChange: (field: keyof ProductFormData, value: any) => void
  onCancel: () => void
  loading: boolean
}

export default function ProductForm({
  formData,
  categories,
  editingProduct,
  onSubmit,
  onInputChange,
  onCancel,
  loading
}: ProductFormProps) {
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')

  const addSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      onInputChange('specs', {
        ...formData.specs,
        [newSpecKey.trim()]: newSpecValue.trim()
      })
      setNewSpecKey('')
      setNewSpecValue('')
    }
  }

  const removeSpec = (key: string) => {
    const newSpecs = { ...formData.specs }
    delete newSpecs[key]
    onInputChange('specs', newSpecs)
  }

  const handleImagesChange = (images: string[], mainImage: string) => {
    onInputChange('images', images)
    onInputChange('main_image', mainImage)
    // También guardar en thumbnail_url como backup
    if (mainImage) {
      // noop here; thumbnail_url is set elsewhere based on main_image
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select onValueChange={(value) => onInputChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => onInputChange('price', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="compare_at_price">Precio Original (Oferta)</Label>
              <Input
                id="compare_at_price"
                type="number"
                step="0.01"
                value={formData.compare_at_price}
                onChange={(e) => onInputChange('compare_at_price', e.target.value)}
                placeholder="Para mostrar descuento"
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => onInputChange('stock', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <ImageUploader
            images={formData.images}
            mainImage={formData.main_image}
            onChange={handleImagesChange}
          />

          {/* Specifications */}
          <div>
            <Label>Especificaciones</Label>
            <div className="space-y-3">
              {Object.entries(formData.specs).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2 border rounded">
                  <Badge variant="outline">{key}</Badge>
                  <span className="flex-1">{value}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpec(key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre de la especificación"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                />
                <Input
                  placeholder="Valor"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                />
                <Button type="button" onClick={addSpec} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')} Producto
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
