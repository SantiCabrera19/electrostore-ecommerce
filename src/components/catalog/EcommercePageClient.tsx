'use client'

import { useState, useMemo } from 'react'
import ProductGrid from './ProductGrid'
import type { Tables } from '@/types/supabase'

type Product = Tables<'products'>
type Category = Tables<'categories'>

type Props = {
  initialProducts: Product[]
  categories: Category[]
  initialCategory: string | null
  initialPage: number
  totalPages: number
}

export default function EcommercePageClient({
  initialProducts,
  categories,
  initialCategory,
  initialPage,
  totalPages,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)
  const [showOnlyOffers, setShowOnlyOffers] = useState(false)

  // Apply client-side filters to the paginated products from server
  const filteredProducts = useMemo(() => {
    if (!initialProducts || !Array.isArray(initialProducts)) return []
    
    let filtered = [...initialProducts]
    
    // Apply price filter
    if (priceRange) {
      filtered = filtered.filter(product => 
        product.price >= priceRange.min && product.price <= priceRange.max
      )
    }
    
    // Apply offers filter
    if (showOnlyOffers) {
      filtered = filtered.filter(product => {
        const compareAtPrice = (product as any).compare_at_price
        return compareAtPrice && compareAtPrice > product.price
      })
    }
    
    return filtered
  }, [initialProducts, priceRange, showOnlyOffers])

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
    
    // Update URL and reload page to get new products
    const url = new URL(window.location.href)
    if (categoryId) {
      url.searchParams.set('category', categoryId)
    } else {
      url.searchParams.delete('category')
    }
    url.searchParams.delete('page')
    window.location.href = url.toString()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    
    // Update URL and reload page to get new products
    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    window.location.href = url.toString()
  }

  const handlePriceFilter = (min: number, max: number) => {
    // Si min es 0 y max es Infinity, limpiar el filtro
    if (min === 0 && max === Infinity) {
      setPriceRange(null)
    } else {
      setPriceRange({ min, max })
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleOffersToggle = (showOffers: boolean) => {
    setShowOnlyOffers(showOffers)
    setCurrentPage(1) // Reset to first page when filtering
  }


  return (
    <ProductGrid
      products={filteredProducts}
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onPriceFilter={handlePriceFilter}
      onOffersToggle={handleOffersToggle}
      showOnlyOffers={showOnlyOffers}
    />
  )
}