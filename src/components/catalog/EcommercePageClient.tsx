'use client'

import { useState } from 'react'
import ProductGrid from './ProductGrid'
import type { Tables } from '@/types/supabase'
import { useRouter } from 'next/navigation'

type Product = Tables<'products'>
type Category = Tables<'categories'>

interface EcommercePageClientProps {
  products: Product[]
  categories: Category[]
  selectedCategory: string | null
  currentPage: number
  totalPages: number
  totalProducts: number
}

export default function EcommercePageClient({
  products,
  categories,
  selectedCategory,
  currentPage,
  totalPages,
  totalProducts,
}: EcommercePageClientProps) {
  const router = useRouter()

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    params.set('page', '1') // Reset to first page on category change
    router.push(`/?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', page.toString())
    router.push(`/?${params.toString()}`)
  }

  return (
    <ProductGrid 
      products={products} 
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}