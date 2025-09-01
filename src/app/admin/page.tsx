'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import AdminHeader from '@/components/admin/AdminHeader'
import BannersManager from '@/components/admin/BannersManager'
import ProductFormModal from '@/components/admin/ProductFormModal'
import ProductGrid from '@/components/admin/ProductGrid'
import CSVImporter from '@/components/admin/CSVImporter'
import { useAdminData } from '@/hooks/useAdminData'
import { useProductForm } from '@/hooks/useProductForm'

export default function AdminPanel() {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const {
    products,
    categories,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    bulkCreateProducts,
    getStats
  } = useAdminData()

  const {
    formData,
    setFormData,
    uploadedImages,
    mainImageIndex,
    showForm,
    editingProduct,
    startNewProduct,
    startEditProduct,
    handleImageUpload,
    handleMainImageChange,
    handleRemoveImage,
    prepareFormDataForSubmit,
    setShowForm
  } = useProductForm()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const submitData = prepareFormDataForSubmit()
      
      if (editingProduct) {
        await updateProduct(editingProduct.id, submitData, uploadedImages)
      } else {
        await createProduct(submitData, uploadedImages)
      }
      
      setShowForm(false)
      alert("Producto guardado exitosamente!")
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error al guardar producto")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProduct(id)
        alert("Producto eliminado exitosamente!")
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Error al eliminar producto")
      }
    }
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      await toggleProductVisibility(id, isVisible)
    } catch (error) {
      console.error("Error toggling visibility:", error)
      alert("Error al cambiar visibilidad")
    }
  }

  const handleCSVImport = async (products: any[]) => {
    await bulkCreateProducts(products)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary hover:underline"
          >
            Recargar página
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-none sm:max-w-7xl">
        <AdminHeader 
          stats={getStats()}
          onNewProduct={startNewProduct}
        />

        <div className="mt-8 space-y-8">
          {/* Gestión de Banners */}
          <BannersManager />

          <CSVImporter 
            categories={categories}
            onImport={handleCSVImport}
          />
          
          {/* Separador visual elegante */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium tracking-wider">
                Gestión de Productos
              </span>
            </div>
          </div>
          
          <ProductGrid
            products={products}
            categories={categories}
            onEditProduct={startEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>

        <ProductFormModal
          show={showForm}
          editingProduct={editingProduct}
          categories={categories}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          onImageUpload={handleImageUpload}
          uploadedImages={uploadedImages}
          mainImageIndex={mainImageIndex}
          onMainImageChange={handleMainImageChange}
          onRemoveImage={handleRemoveImage}
        />
      </div>
    </div>
  )
}
