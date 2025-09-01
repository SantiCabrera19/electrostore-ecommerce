'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter } from 'lucide-react'
import ProductCard from './ProductCard'
import type { Database } from '@/types/supabase'

type Product = Database["public"]["Tables"]["products"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"]

interface ProductGridProps {
  products: Product[]
  categories: Category[]
  onEditProduct: (product: Product) => void
  onDeleteProduct: (id: string) => void
  onToggleVisibility: (id: string, isVisible: boolean) => void
}

export default function ProductGrid({
  products,
  categories,
  onEditProduct,
  onDeleteProduct,
  onToggleVisibility
}: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')

  // Filter and sort products - newest first
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
      
      const matchesStock = stockFilter === 'all' || 
                          (stockFilter === 'in-stock' && product.stock > 0) ||
                          (stockFilter === 'low-stock' && product.stock > 0 && product.stock <= 10) ||
                          (stockFilter === 'out-of-stock' && product.stock === 0)
      
      const matchesVisibility = visibilityFilter === 'all' ||
                               (visibilityFilter === 'visible' && product.active) ||
                               (visibilityFilter === 'hidden' && !product.active)

      return matchesSearch && matchesCategory && matchesStock && matchesVisibility
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const stats = {
    total: products.length,
    visible: products.filter(p => p.active).length,
    hidden: products.filter(p => !p.active).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.visible}</div>
          <div className="text-sm text-muted-foreground">Visibles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-500">{stats.hidden}</div>
          <div className="text-sm text-muted-foreground">Ocultos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          <div className="text-sm text-muted-foreground">Sin Stock</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
          <div className="text-sm text-muted-foreground">Stock Bajo</div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stock Filter */}
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todo el stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el stock</SelectItem>
              <SelectItem value="in-stock">Con stock</SelectItem>
              <SelectItem value="low-stock">Stock bajo (≤10)</SelectItem>
              <SelectItem value="out-of-stock">Sin stock</SelectItem>
            </SelectContent>
          </Select>

          {/* Visibility Filter */}
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="visible">Visibles</SelectItem>
              <SelectItem value="hidden">Ocultos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Búsqueda: "{searchTerm}"
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Categoría: {categories.find(c => c.id.toString() === selectedCategory)?.name}
            </Badge>
          )}
          {stockFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Stock: {stockFilter === 'in-stock' ? 'Con stock' : 
                     stockFilter === 'low-stock' ? 'Stock bajo' : 'Sin stock'}
            </Badge>
          )}
          {visibilityFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Estado: {visibilityFilter === 'visible' ? 'Visibles' : 'Ocultos'}
            </Badge>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Productos ({filteredProducts.length})
          </h3>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {products.length === 0 ? (
                <div>
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-lg mb-2">No hay productos aún</p>
                  <p className="text-sm">Crea tu primer producto para comenzar</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-lg mb-2">No se encontraron productos</p>
                  <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                onToggleVisibility={onToggleVisibility}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
