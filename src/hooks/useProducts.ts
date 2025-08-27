'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'

export type Product = Tables<'products'>
export type Category = Tables<'categories'>

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*')
      ])

      if (productsResult.error) throw productsResult.error
      if (categoriesResult.error) throw categoriesResult.error

      setProducts(productsResult.data || [])
      setCategories(categoriesResult.data || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const getProductBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  const getProductsByCategory = (categoryId: string | null) => {
    if (!categoryId) return products
    return products.filter(product => product.category_id === categoryId)
  }

  const searchProducts = (query: string) => {
    if (!query.trim()) return products
    
    const searchTerm = query.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    )
  }

  const getProductsWithOffers = () => {
    return products.filter(product => {
      const compareAtPrice = (product as any).compare_at_price
      return compareAtPrice && compareAtPrice > product.price
    })
  }

  const filterByPriceRange = (min: number, max: number) => {
    return products.filter(product => 
      product.price >= min && product.price <= max
    )
  }

  return {
    products,
    categories,
    loading,
    error,
    getProductBySlug,
    getProductsByCategory,
    searchProducts,
    getProductsWithOffers,
    filterByPriceRange,
    reload: loadData
  }
}
