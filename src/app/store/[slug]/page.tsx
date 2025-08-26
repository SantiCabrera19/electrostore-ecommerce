"use client"

import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Truck, Shield, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { addToCart } from "@/lib/cart"
import { getAllProductImages } from "@/lib/images"

// Utilidad para formatear precio
function formatPrice(value: number) {
  return value.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
}

type PageProps = {
  params: { slug: string }
  searchParams: { id?: string }
}

// Genera un slug compatible con las URLs
function toSlug(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export default function ProductDetailPage({ params, searchParams }: PageProps) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState<string | undefined>()
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        let productData = null

        // 1) Preferir buscar por id cuando viene en el query string
        if (searchParams.id) {
          const { data, error } = await supabase
            .from("products")
            .select("id, name, description, price, images, specs, category_id")
            .eq("id", searchParams.id)
            .single()

          if (data && !error) {
            productData = data
          }
        }

        // 2) Si no hay id o no se encontró, buscar por slug
        if (!productData) {
          const { data: products, error: slugError } = await supabase
            .from("products")
            .select("id, name, description, price, images, specs, category_id")

          if (!slugError && products) {
            productData = products.find((p: any) => toSlug(p.name) === params.slug)
          }
        }

        if (!productData) {
          router.push('/404')
          return
        }

        setProduct(productData)

        // Cargar nombre de la categoría
        if (productData.category_id) {
          const { data: cat } = await supabase
            .from("categories")
            .select("name")
            .eq("id", productData.category_id)
            .single()
          setCategoryName(cat?.name)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.slug, searchParams.id, supabase, router])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return <ProductDetails product={product} categoryName={categoryName} />
}

function ProductDetails({ product, categoryName }: { product: any, categoryName?: string }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const specs = (product.specs ?? {}) as Record<string, unknown>
    const originalPrice =
      typeof specs["original_price"] === "number" ? (specs["original_price"] as number) : undefined
    const installments =
      typeof specs["installments"] === "string" ? (specs["installments"] as string) : undefined
    const discount =
      originalPrice && originalPrice > product.price
        ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
        : 0

    const productImages = getAllProductImages(product.id)

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
    }

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:underline">Inicio</Link> {">"}{" "}
          {categoryName ? <span className="hover:underline">{categoryName}</span> : "Producto"}{" "}
          {">"} <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería */}
          <div>
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-1 flex lg:flex-col gap-2">
                {productImages.map((src: string, idx: number) => (
                  <div 
                    key={idx} 
                    className={`relative overflow-hidden rounded-md border transition-all cursor-pointer ${
                      idx === currentImageIndex ? 'border-primary border-2' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img 
                      src={src} 
                      alt={`Miniatura ${idx + 1}`} 
                      className="h-16 w-16 object-contain bg-gray-50 p-1" 
                    />
                  </div>
                ))}
              </div>
              <Card className="col-span-4 border-border">
                <CardContent className="p-0 relative">
                  <img
                    src={productImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-[420px] object-contain bg-gray-50 rounded-lg p-8"
                  />
                  
                  {/* Flechas de navegación */}
                  {productImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Indicador de imagen actual */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {productImages.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                            idx === currentImageIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          onClick={() => setCurrentImageIndex(idx)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Panel derecho */}
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
              <Button 
                className="btn-primary min-w-48"
                onClick={() => {
                  addToCart(product.id)
                  console.log('Producto agregado al carrito:', product.name)
                }}
              >
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
        </div>

        {/* Especificaciones y descripción */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <details className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors" open>
            <summary className="cursor-pointer font-medium text-foreground">
              <span className="border-l-4 border-primary pl-2">Especificaciones técnicas</span>
            </summary>
            <div className="mt-4 text-sm">
              {product.specs && typeof product.specs === "object" ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {Object.entries(product.specs as Record<string, unknown>).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-border py-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-foreground">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="text-muted-foreground">Sin especificaciones</div>
              )}
            </div>
          </details>

          <details className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors" open>
            <summary className="cursor-pointer font-medium text-foreground">
              <span className="border-l-4 border-primary pl-2">Descripción</span>
            </summary>
            <div className="mt-4 text-sm text-foreground">
              {product.description ?? "Sin descripción"}
            </div>
          </details>
        </div>
      </div>
    )
}
