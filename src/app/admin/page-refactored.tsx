'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ProductForm from '@/components/forms/ProductForm'
import ProductList from '@/components/forms/ProductList'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'

export default function AdminPanel() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
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
  } = useAdmin()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const handleFormSubmit = async (e: React.FormEvent) => {
    try {
      await handleSubmit(e)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar el producto')
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar el producto')
    }
  }

  const handleView = (productSlug: string) => {
    window.open(`/products/${productSlug}`, '_blank')
  }

  if (authLoading) {
    return <LoadingSkeleton variant="page" />
  }

  if (!user) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-none sm:max-w-7xl">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Panel de Administración
            </h1>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {showForm && (
              <ProductForm
                formData={formData}
                categories={categories}
                editingProduct={editingProduct}
                onSubmit={handleFormSubmit}
                onInputChange={handleInputChange}
                onCancel={resetForm}
                loading={loading}
              />
            )}

            <ProductList
              products={products}
              categories={categories}
              onEdit={startEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
