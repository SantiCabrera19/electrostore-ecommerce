'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import ImageUploader from '@/components/forms/ImageUploader'
import type { Database } from '@/types/supabase'

type Product = Database["public"]["Tables"]["products"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"]

interface ProductFormData {
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

interface ProductFormModalProps {
  show: boolean
  editingProduct: Product | null
  categories: Category[]
  formData: ProductFormData
  onFormDataChange: (data: ProductFormData) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  onCancel: () => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadedImages: File[]
  mainImageIndex: number
  onMainImageChange: (index: number) => void
  onRemoveImage: (index: number) => void
}

export default function ProductFormModal({
  show,
  editingProduct,
  categories,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  onImageUpload,
  uploadedImages,
  mainImageIndex,
  onMainImageChange,
  onRemoveImage
}: ProductFormModalProps) {
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  // Scroll to form when it opens
  useEffect(() => {
    if (show && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
    }
  }, [show])

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value })
  }

  const addSpec = () => {
    if (newSpecKey && newSpecValue) {
      onFormDataChange({
        ...formData,
        specs: { ...formData.specs, [newSpecKey]: newSpecValue }
      })
      setNewSpecKey('')
      setNewSpecValue('')
    }
  }

  const removeSpec = (key: string) => {
    const newSpecs = { ...formData.specs }
    delete newSpecs[key]
    onFormDataChange({ ...formData, specs: newSpecs })
  }

  if (!show) return null

  return (
    <Card ref={formRef} className="mb-6 sm:mb-8">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">
          {editingProduct ? "Editar Producto" : "Nuevo Producto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="ej: Refrigerador Samsung 300L"
              />
              {formData.name && (
                <p className="text-xs text-muted-foreground mt-1">
                  URL: /store/{formData.name.toLowerCase()
                    .replace(/[áéíóúñü]/g, (match) => {
                      const map: {[key: string]: string} = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ü': 'u' }
                      return map[match] || match
                    })
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="price">Precio Actual</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                placeholder="ej: 89999"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Precio de venta actual (ej: 89999 = $89.999)
              </p>
            </div>
            <div>
              <Label htmlFor="compare_at_price">Precio Original (Oferta)</Label>
              <Input
                id="compare_at_price"
                type="number"
                step="0.01"
                value={formData.compare_at_price}
                onChange={(e) => handleInputChange('compare_at_price', e.target.value)}
                placeholder="ej: 119999"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Precio original (opcional). Si es mayor al precio actual, se mostrará como oferta
              </p>
            </div>
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Specifications */}
          <div>
            <Label>Especificaciones Técnicas</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Característica (ej: color, capacidad)"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                />
                <Input
                  placeholder="Valor (ej: Acero Inoxidable, 500L)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                />
                <Button type="button" onClick={addSpec} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {Object.entries(formData.specs).length > 0 && (
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium">Especificaciones agregadas:</p>
                  {Object.entries(formData.specs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm"><strong>{key}:</strong> {value}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpec(key)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div>
            <ImageUploader
              images={formData.images}
              mainImage={formData.main_image}
              onChange={(images, mainImage) => {
                onFormDataChange({ ...formData, images, main_image: mainImage })
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <Button type="submit" className="flex-1 sm:flex-none">
              {editingProduct ? "Actualizar" : "Crear"} Producto
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
