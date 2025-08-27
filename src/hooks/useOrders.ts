'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'

export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>

export interface OrderWithItems extends Order {
  order_items: Array<OrderItem & {
    products: Tables<'products'>
  }>
}

export interface CreateOrderData {
  user_id: string
  total: number
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  customer_province: string
  customer_postal_code: string
  customer_notes?: string
}

export interface CreateOrderItemData {
  order_id: string
  product_id: string
  quantity: number
  price: number
}

export function useOrders() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  const createOrder = async (orderData: CreateOrderData) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          status: 'pending',
          currency_code: 'ARS',
          subtotal: orderData.total,
          discount_total: 0,
          shipping_cost: 0,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating order'
      setError(errorMessage)
      console.error('Error creating order:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createOrderItems = async (orderItems: CreateOrderItemData[]) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (error) throw error
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating order items'
      setError(errorMessage)
      console.error('Error creating order items:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getOrderById = async (orderId: string): Promise<OrderWithItems> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error
      return data as OrderWithItems
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching order'
      setError(errorMessage)
      console.error('Error fetching order:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getUserOrders = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as OrderWithItems[]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching user orders'
      setError(errorMessage)
      console.error('Error fetching user orders:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating order status'
      setError(errorMessage)
      console.error('Error updating order status:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createOrder,
    createOrderItems,
    getOrderById,
    getUserOrders,
    updateOrderStatus
  }
}
