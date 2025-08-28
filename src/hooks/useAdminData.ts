'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Product = Database["public"]["Tables"]["products"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"]

interface ProductFormData {
  name: string
  price: string
  compare_at_price: string
  description: string
  stock: string
  category_id: string
  images: string[]
  main_image: string
  specs: Record<string, string>
}

export function useAdminData() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name')
      ])

      if (productsResult.error) throw productsResult.error
      if (categoriesResult.error) throw categoriesResult.error

      setProducts(productsResult.data || [])
      setCategories(categoriesResult.data || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (formData: ProductFormData, uploadedImages: File[]) => {
    try {
      setError(null)

      // Upload images first
      const imageUrls: string[] = []
      for (const file of uploadedImages) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })
        
        if (!response.ok) {
          throw new Error('Error uploading image')
        }
        
        const result = await response.json()
        imageUrls.push(result.url)
      }

      // Create product
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          price: parseFloat(formData.price),
          compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
          description: formData.description || null,
          stock: parseInt(formData.stock),
          category_id: formData.category_id,
          images: imageUrls,
          main_image: formData.main_image || (imageUrls.length > 0 ? imageUrls[0] : null),
          specs: formData.specs,
          active: true
        })
        .select()
        .single()

      if (error) throw error

      setProducts(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateProduct = async (id: string, formData: ProductFormData, uploadedImages: File[]) => {
    try {
      setError(null)

      // Upload new images if any
      const newImageUrls: string[] = []
      for (const file of uploadedImages) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })
        
        if (!response.ok) {
          throw new Error('Error uploading image')
        }
        
        const result = await response.json()
        newImageUrls.push(result.url)
      }

      // Combine existing and new images
      const allImages = [...formData.images, ...newImageUrls]

      const { data, error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          price: parseFloat(formData.price),
          compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
          description: formData.description || null,
          stock: parseInt(formData.stock),
          category_id: formData.category_id,
          images: allImages,
          main_image: formData.main_image || (allImages.length > 0 ? allImages[0] : null),
          specs: formData.specs
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setProducts(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      console.error('Error updating product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const toggleProductVisibility = async (id: string, isVisible: boolean) => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('products')
        .update({ active: isVisible })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setProducts(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      console.error('Error toggling visibility:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getStats = () => {
    return {
      totalProducts: products.length,
      totalOrders: 0, // TODO: Implement when orders table is ready
      totalRevenue: 0, // TODO: Calculate from orders
      totalCustomers: 0 // TODO: Get from auth users
    }
  }

  return {
    products,
    categories,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    getStats,
    refreshData: loadData
  }
}
