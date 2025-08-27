"use client"

import Link from "next/link"
import PriceFilter from "./PriceFilter"
import OffersFilter from "./OffersFilter"
import type { Tables } from '@/types/supabase'

type Category = Tables<'categories'>
type Product = Tables<'products'>

interface CategorySidebarProps {
  categories: Category[]
  products: Product[]
  selectedCategory: string | null
  filteredProducts: Product[]
  onPriceFilter: (min: number, max: number) => void
  onOffersToggle: (showOnlyOffers: boolean) => void
  showOnlyOffers: boolean
}

export default function CategorySidebar({ 
  categories, 
  products, 
  selectedCategory, 
  filteredProducts,
  onPriceFilter,
  onOffersToggle,
  showOnlyOffers
}: CategorySidebarProps) {
  const countsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = products.filter(p => p.category_id === cat.id).length
    return acc
  }, {} as Record<string, number>)

  // Contar productos con ofertas
  const offersCount = products.filter(p => {
    const compareAtPrice = (p as any).compare_at_price
    return compareAtPrice && compareAtPrice > p.price
  }).length

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      {/* Mobile: Horizontal scroll categories */}
      <div className="lg:hidden mb-4">
        <div className="flex overflow-x-auto space-x-2 pb-2">
          <Link
            href="/"
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors ${
              selectedCategory === null ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            }`}
          >
            Todos ({filteredProducts.length})
          </Link>

          {categories.filter(cat => cat.name !== 'Limpieza').map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.id}`}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {cat.name} ({countsByCategory[cat.id] ?? 0})
            </Link>
          ))}
        </div>
        
        {/* Mobile: Filtros */}
        <div className="mt-4 space-y-3">
          <OffersFilter 
            onOffersToggle={onOffersToggle}
            showOnlyOffers={showOnlyOffers}
            offersCount={offersCount}
          />
          <PriceFilter 
            products={products}
            onPriceChange={onPriceFilter}
            filteredCount={filteredProducts.length}
          />
        </div>
      </div>

      {/* Desktop: Vertical sidebar */}
      <div className="hidden lg:block p-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredProducts.length} de {products.length} productos
          </p>
        </div>

        <div className="mb-6">
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

        {/* Filtros */}
        <div className="space-y-4">
          <OffersFilter 
            onOffersToggle={onOffersToggle}
            showOnlyOffers={showOnlyOffers}
            offersCount={offersCount}
          />
          <PriceFilter 
            products={products}
            onPriceChange={onPriceFilter}
            filteredCount={filteredProducts.length}
          />
        </div>
      </div>
    </div>
  )
}
