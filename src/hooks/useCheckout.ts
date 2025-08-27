'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'
import { useCart } from './useCart'
import { useOrders } from './useOrders'
import { validateCheckoutForm } from '@/utils/validators'
import type { CheckoutFormData } from '@/components/forms/CheckoutForm'

export function useCheckout() {
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: ''
  })

  const router = useRouter()
  const { user, getUserProfile } = useAuth()
  const { cartItems, getTotalPrice, clearAllItems } = useCart()
  const { createOrder, createOrderItems } = useOrders()

  const initializeForm = async () => {
    if (user) {
      try {
        const userProfile = await getUserProfile(user.id)
        if (userProfile) {
          setFormData(prev => ({
            ...prev,
            fullName: userProfile.full_name || '',
            email: userProfile.email || user.email || ''
          }))
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    }
  }

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      if (!user) {
        throw new Error('Debes iniciar sesión para completar la compra')
      }

      if (cartItems.length === 0) {
        throw new Error('El carrito está vacío')
      }

      // Validate form data
      const validation = validateCheckoutForm(formData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      const totalPrice = getTotalPrice()

      // Create order
      const order = await createOrder({
        user_id: user.id,
        total: totalPrice,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_city: formData.city,
        customer_province: formData.province,
        customer_postal_code: formData.postalCode,
        customer_notes: formData.notes
      })

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.product!.price
      }))

      await createOrderItems(orderItems)

      // Clear cart and redirect
      clearAllItems()
      router.push(`/store/order-success?order=${order.id}`)

    } catch (error) {
      console.error('Error processing order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar la orden'
      throw new Error(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  return {
    formData,
    processing,
    handleInputChange,
    handleSubmit,
    initializeForm
  }
}
