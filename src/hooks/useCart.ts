'use client'

import { useState, useEffect } from 'react'
import { getCart, addToCart, removeFromCart, updateCartQuantity, clearCart } from '@/lib/cart'
import { createBrowserClient } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'

export type CartItem = {
  id: string
  product: Tables<'products'> | null
  quantity: number
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      const cartData = getCart()
      
      if (cartData.length === 0) {
        setCartItems([])
        return
      }

      const itemsWithProducts = await Promise.all(
        cartData.map(async (item: any) => {
          const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.productId)
            .single()
          
          return {
            id: item.productId,
            product,
            quantity: item.quantity
          }
        })
      )
      
      setCartItems(itemsWithProducts.filter(item => item.product) as CartItem[])
    } catch (error) {
      console.error('Error loading cart:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const addItem = (productId: string, quantity: number = 1) => {
    addToCart(productId, quantity)
    loadCart() // Reload to get updated data
  }

  const removeItem = (productId: string) => {
    removeFromCart(productId)
    loadCart()
  }

  const updateQuantity = (productId: string, quantity: number) => {
    updateCartQuantity(productId, quantity)
    loadCart()
  }

  const clearAllItems = () => {
    clearCart()
    setCartItems([])
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => 
      total + (item.product!.price * item.quantity), 0
    )
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const isEmpty = cartItems.length === 0

  return {
    cartItems,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearAllItems,
    getTotalPrice,
    getTotalItems,
    isEmpty,
    reload: loadCart
  }
}
