'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useProducts } from './useProducts'
import type { Product } from '@/hooks/useProducts'
import type { ProductFormData } from '@/components/forms/ProductForm'

export function useAdmin() {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    compare_at_price: '',
    description: '',
    stock: '',
    category_id: '',
    images: [],
    main_image: '',
    specs: {}
  })

  const supabase = createBrowserClient()
  const { user } = useAuth()
  const { products, categories, reload: reloadProducts } = useProducts()

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      compare_at_price: '',
      description: '',
      stock: '',
      category_id: '',
      images: [],
      main_image: '',
      specs: {}
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      compare_at_price: (product as any).compare_at_price?.toString() || '',
      description: product.description || '',
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      images: (product as any).images || [],
      main_image: (product as any).main_image || '',
      specs: (product as any).specs || {}
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        description: formData.description,
        stock: parseInt(formData.stock),
        category_id: formData.category_id || null,
        images: formData.images,
        main_image: formData.main_image,
        specs: formData.specs,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData)
        
        if (error) throw error
      }

      await reloadProducts()
      resetForm()
    } catch (error) {
      console.error('Error saving product:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
      
      if (error) throw error
      await reloadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    products,
    categories,
    loading,
    showForm,
    editingProduct,
    formData,
    setShowForm,
    handleInputChange,
    startEdit,
    handleSubmit,
    deleteProduct,
    resetForm
  }
}
