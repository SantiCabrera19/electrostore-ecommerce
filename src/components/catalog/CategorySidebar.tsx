"use client"

import Link from "next/link"
import type { Tables } from '@/types/supabase'

type Category = Tables<'categories'>
type Product = Tables<'products'>

interface CategorySidebarProps {
  categories: Category[]
  products: Product[]
  selectedCategory: string | null
  filteredProducts: Product[]
}

export default function CategorySidebar({ 
  categories, 
  products, 
  selectedCategory, 
  filteredProducts 
}: CategorySidebarProps) {
  const countsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = products.filter(p => p.category_id === cat.id).length
    return acc
  }, {} as Record<string, number>)

  return (
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
    </div>
  )
}
