'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase'

type Product = Database["public"]["Tables"]["products"]["Row"]

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

const initialFormData: ProductFormData = {
  name: '',
  price: '',
  compare_at_price: '',
  description: '',
  stock: '',
  category_id: '',
  images: [],
  main_image: '',
  specs: {}
}

export function useProductForm() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const resetForm = () => {
    setFormData(initialFormData)
    setUploadedImages([])
    setMainImageIndex(0)
    setEditingProduct(null)
    setShowForm(false)
  }

  const startNewProduct = () => {
    resetForm()
    setShowForm(true)
  }

  const startEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      description: product.description || '',
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      images: product.images || [],
      main_image: product.main_image || product.thumbnail_url || '',
      specs: typeof product.specs === 'object' && product.specs !== null ? product.specs as Record<string, string> : {}
    })
    setUploadedImages([])
    setMainImageIndex(0)
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedImages(prev => [...prev, ...files])
  }

  const handleMainImageChange = (index: number) => {
    setMainImageIndex(index)
    if (uploadedImages[index]) {
      // For new uploads, we'll set the main image after upload
      setFormData(prev => ({ ...prev, main_image: '' }))
    }
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    if (mainImageIndex >= index && mainImageIndex > 0) {
      setMainImageIndex(mainImageIndex - 1)
    }
  }

  const handleRemoveExistingImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl),
      main_image: prev.main_image === imageUrl ? (prev.images[0] || '') : prev.main_image
    }))
  }

  const prepareFormDataForSubmit = (): ProductFormData => {
    let mainImage = formData.main_image
    
    // If we have uploaded images and a main image index is selected
    if (uploadedImages.length > 0 && mainImageIndex < uploadedImages.length) {
      // The main image will be set after upload in the hook that calls this
      mainImage = '' // Will be set by the calling component after upload
    }

    return {
      ...formData,
      main_image: mainImage
    }
  }

  return {
    formData,
    setFormData,
    uploadedImages,
    mainImageIndex,
    showForm,
    editingProduct,
    resetForm,
    startNewProduct,
    startEditProduct,
    handleImageUpload,
    handleMainImageChange,
    handleRemoveImage,
    handleRemoveExistingImage,
    prepareFormDataForSubmit,
    setShowForm
  }
}
