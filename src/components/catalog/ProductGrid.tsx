"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { getAllProductImages, getProductMainImage } from "@/lib/images"
import { Badge } from "@/components/ui/badge"
import type { Tables } from '@/types/supabase'

type Product = Tables<'products'>
type Category = Tables<'categories'>

type Props = {
  products: Product[]
  categories: Category[]
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
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

export default function ProductGrid({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  // Estados para filtros de precio
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [priceRange, setPriceRange] = useState([0, 0])

  // Calcular rango de precios de todos los productos
  const priceStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 }
    const prices = products.map(p => p.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  }, [products])

  // Inicializar rango de precios
  useMemo(() => {
    if (priceStats.min !== minPrice || priceStats.max !== maxPrice) {
      setMinPrice(priceStats.min)
      setMaxPrice(priceStats.max)
      setPriceRange([priceStats.min, priceStats.max])
    }
  }, [priceStats, minPrice, maxPrice])

  // Conteo de productos por categoría
  const countsByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of products) {
      if (p.category_id) {
        map[p.category_id] = (map[p.category_id] ?? 0) + 1
      }
    }
    return map
  }, [products])

  // Filtrar productos por precio
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
  }, [products, priceRange])

  return (
    <div className="flex gap-8">
      {/* Sidebar filtros (categorías desde DB) */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredProducts.length} de {products.length} productos
            </p>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-foreground mb-4">Categorías</h3>
            <div className="space-y-2">
              <Link
                href="/"
                className={`w-full text-left py-2 px-3 rounded transition-colors flex justify-between items-center block ${
                  selectedCategory === null ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <span>Todos los productos</span>
                <span className="text-sm">({filteredProducts.length})</span>
              </Link>

              {categories.filter(cat => cat.name !== 'Limpieza').map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.id}`}
                  className={`w-full text-left py-2 px-3 rounded transition-colors flex justify-between items-center block ${
                    selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-sm">({countsByCategory[cat.id] ?? 0})</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Filtro de Precios */}
          <div className="mb-8">
            <h3 className="font-semibold text-foreground mb-4">PRECIO</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Mínimo</span>
                <span>Máximo</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
              
              {/* Slider de rango */}
              <div className="relative">
                <div className="h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full"
                    style={{
                      marginLeft: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100}%`
                    }}
                  ></div>
                </div>
                
                {/* Controles del slider */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (value <= priceRange[1]) {
                      setPriceRange([value, priceRange[1]])
                    }
                  }}
                  className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (value >= priceRange[0]) {
                      setPriceRange([priceRange[0], value])
                    }
                  }}
                  className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                />
              </div>
              
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} productos
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Grilla de productos 3x2 */}
      <main className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const slug = toSlug(product.name)
            const image = getProductMainImage(product.id)
            const specs = (product.specs ?? {}) as Record<string, unknown>
            const originalPrice =
              typeof specs["original_price"] === "number" ? (specs["original_price"] as number) : undefined
            const installments =
              typeof specs["installments"] === "string" ? (specs["installments"] as string) : undefined
            const hasOffer =
              (typeof specs["has_offer"] === "boolean" && (specs["has_offer"] as boolean)) ||
              (originalPrice && originalPrice > product.price) ||
              false

            return (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border">
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
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">Oferta</Badge>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      <Link href={`/store/${slug}?id=${product.id}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </h3>

                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
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

                    <Button 
                      className="btn-primary w-full"
                      onClick={() => {
                        // Import cart utilities
                        import('@/lib/cart').then(({ addToCart }) => {
                          addToCart(product.id)
                          // Show success feedback (you could add a toast here)
                          console.log('Producto agregado al carrito:', product.name)
                        })
                      }}
                    >
                      Agregar al carrito
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              className="px-3 py-2 rounded border border-border hover:bg-muted text-sm disabled:opacity-50"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }).map((_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true
                if (p === 1 || p === totalPages) return true
                return Math.abs(p - currentPage) <= 1
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1]
                const showDots = prev && p - prev > 1
                return (
                  <span key={p} className="flex">
                    {showDots && <span className="px-2 text-muted-foreground">…</span>}
                    <button
                      onClick={() => onPageChange(p)}
                      className={`px-3 py-2 rounded border text-sm ${
                        currentPage === p
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                )
              })}

            <button
              className="px-3 py-2 rounded border border-border hover:bg-muted text-sm disabled:opacity-50"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </main>
    </div>
  )
}