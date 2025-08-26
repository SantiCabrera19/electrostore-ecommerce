"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]

export default function ProductIdsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name")

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("ID copiado al portapapeles!")
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Cargando productos...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">IDs de Productos</h1>
      <p className="text-muted-foreground mb-6">
        Usa estos IDs para configurar imágenes en src/lib/images.ts
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1 break-all">
                      {product.id}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(product.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Precio:</label>
                  <p className="text-sm">${product.price}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock:</label>
                  <p className="text-sm">{product.stock} unidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Cómo usar:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Copia el ID del producto que quieres configurar</li>
          <li>Ve a <code>src/lib/images.ts</code></li>
          <li>Agrega o actualiza la configuración de imágenes usando ese ID</li>
          <li>Reemplaza cualquier ID temporal con el ID real</li>
        </ol>
      </div>
    </div>
  )
}
