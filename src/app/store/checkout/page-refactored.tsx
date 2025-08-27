'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CheckoutForm from '@/components/forms/CheckoutForm'
import OrderSummary from '@/components/forms/OrderSummary'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useCheckout } from '@/hooks/useCheckout'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { cartItems, loading: cartLoading, getTotalPrice, isEmpty } = useCart()
  const { formData, processing, handleInputChange, handleSubmit, initializeForm } = useCheckout()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (!cartLoading && isEmpty) {
      router.push('/store/cart')
      return
    }

    if (user) {
      initializeForm()
    }
  }, [user, authLoading, isEmpty, cartLoading])

  const handleFormSubmit = async (e: React.FormEvent) => {
    try {
      await handleSubmit(e)
    } catch (error) {
      // Error handling is done in the hook
      alert(error instanceof Error ? error.message : 'Error al procesar la orden')
    }
  }

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-none sm:max-w-7xl">
          <div className="h-8 bg-muted rounded w-1/3 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <LoadingSkeleton variant="form" />
            <LoadingSkeleton variant="form" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-none sm:max-w-7xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">
            Finalizar Compra
          </h1>
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <CheckoutForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleFormSubmit}
              processing={processing}
              totalPrice={getTotalPrice()}
            />
            
            <OrderSummary
              cartItems={cartItems}
              totalPrice={getTotalPrice()}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
