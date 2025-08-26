"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Upload, Plus, Edit, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"]

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    compare_at_price: '',
    description: '',
    stock: '',
    category_id: '',
    images: [] as string[],
    main_image: '' as string,
    specs: {} as Record<string, string>
  })
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')

  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [mainImageIndex, setMainImageIndex] = useState<number>(0)

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Check if user is admin (you can implement this check)
    setUser(user)
  }

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*")
      ])

      if (productsRes.data) setProducts(productsRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedImages(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    // Ajustar el índice de la imagen principal si es necesario
    if (index === mainImageIndex) {
      setMainImageIndex(0) // Resetear a la primera imagen
    } else if (index < mainImageIndex) {
      setMainImageIndex(prev => prev - 1) // Decrementar si se eliminó una imagen anterior
    }
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload images')
    }

    const result = await response.json()
    return result.files
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Upload images first
      const uploadedImageNames = await uploadImages(uploadedImages)
      
      // Combine existing images with new uploaded images
      const allImages = editingProduct 
        ? [...(formData.images || []), ...uploadedImageNames]
        : uploadedImageNames
      
      // Set main image - if new images uploaded, use the selected one, otherwise keep existing
      let mainImage = formData.main_image
      if (uploadedImageNames.length > 0) {
        mainImage = uploadedImageNames[mainImageIndex] || uploadedImageNames[0]
      } else if (!mainImage && allImages.length > 0) {
        mainImage = allImages[0]
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id, // Keep as string (UUID)
        stock: parseInt(formData.stock),
        images: allImages,
        main_image: mainImage,
        specs: formData.specs
      }

      if (editingProduct) {
        await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)
      } else {
        await supabase
          .from("products")
          .insert([productData])
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        compare_at_price: "",
        category_id: "",
        stock: "",
        specs: {},
        images: [],
        main_image: ""
      })
      setUploadedImages([])
      setShowForm(false)
      setEditingProduct(null)
      loadData()

      alert("Producto guardado exitosamente!")
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error al guardar producto")
    }
  }

  const deleteProduct = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      await supabase.from("products").delete().eq("id", id)
      loadData()
    }
  }

  const editProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      compare_at_price: (product as any).compare_at_price?.toString() || "",
      category_id: product.category_id?.toString() || "",
      stock: product.stock.toString(),
      specs: (product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)) 
        ? product.specs as Record<string, string> 
        : {},
      images: product.images || [],
      main_image: (product as any).main_image || ""
    })
    setShowForm(true)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-none sm:max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">Panel de Administración</h1>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <Button onClick={() => setShowForm(true)} className="self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

      {showForm && (
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))}
                    placeholder="ej: 119999"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Precio original (opcional). Si es mayor al precio actual, se mostrará como oferta
                  </p>
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Especificaciones */}
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
                    <Button
                      type="button"
                      onClick={() => {
                        if (newSpecKey && newSpecValue) {
                          setFormData(prev => ({
                            ...prev,
                            specs: { ...prev.specs, [newSpecKey]: newSpecValue }
                          }))
                          setNewSpecKey('')
                          setNewSpecValue('')
                        }
                      }}
                      size="sm"
                    >
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
                            onClick={() => {
                              setFormData(prev => {
                                const newSpecs = { ...prev.specs }
                                delete newSpecs[key]
                                return { ...prev, specs: newSpecs }
                              })
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="images">Imágenes del Producto</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mb-2"
                />
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className={`w-full h-20 object-cover rounded border-2 cursor-pointer transition-all ${
                          index === mainImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary/50'
                        }`}
                        onClick={() => setMainImageIndex(index)}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      {index === mainImageIndex && (
                        <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {uploadedImages.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Haz clic en una imagen para marcarla como principal
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Button type="submit" className="flex-1 sm:flex-none">
                  {editingProduct ? "Actualizar" : "Crear"} Producto
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProduct(null)
                    setFormData({
                      name: "",
                      description: "",
                      price: "",
                      compare_at_price: "",
                      category_id: "",
                      stock: "",
                      specs: {},
                      images: [],
                      main_image: ""
                    })
                    setUploadedImages([])
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2 flex-1">{product.name}</h3>
                <div className="flex flex-col items-end gap-1">
                  {(product as any).compare_at_price && (product as any).compare_at_price > product.price && (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">OFERTA</Badge>
                      <span className="text-xs text-muted-foreground line-through">${(product as any).compare_at_price}</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="self-start text-xs">${product.price}</Badge>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Stock: {product.stock}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editProduct(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProduct(product.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  )
}
