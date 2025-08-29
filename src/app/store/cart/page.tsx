'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { getCart, updateCartQuantity, removeFromCart } from "@/lib/cart"
import { getProductMainImage } from "@/lib/images"
import { createBrowserClient } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'

type CartItem = {
  id: string
  product: Tables<'products'>
  quantity: number
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    // For now, use localStorage for cart (simple implementation)
    // In production, you'd want to sync with Supabase for logged-in users
    loadCart()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadCart = async () => {
    try {
      const cartData = localStorage.getItem('electrostore_cart')
      if (cartData) {
        const cart = JSON.parse(cartData)
        
        // Filter out invalid cart items
        const validCartItems = cart.filter((item: any) => 
          item.productId && 
          typeof item.productId === 'string' && 
          item.productId.length > 0 &&
          typeof item.quantity === 'number' &&
          item.quantity > 0
        )
        
        if (validCartItems.length === 0) {
          setCartItems([])
          localStorage.removeItem('electrostore_cart')
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }))
          return
        }
        
        // Update localStorage if we filtered out invalid items
        if (validCartItems.length !== cart.length) {
          localStorage.setItem('electrostore_cart', JSON.stringify(validCartItems))
        }
        
        const itemsWithProducts = await Promise.all(
          validCartItems.map(async (item: any) => {
            try {
              const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', item.productId)
                .single()
              
              if (error) {
                console.warn(`Product not found: ${item.productId}`, error)
                return null
              }
              
              return {
                id: item.productId,
                product,
                quantity: item.quantity
              }
            } catch (error) {
              console.warn(`Error fetching product ${item.productId}:`, error)
              return null
            }
          })
        )
        
        const validItems = itemsWithProducts.filter(item => item && item.product)
        setCartItems(validItems as CartItem[])
        
        // If some products were not found, update the cart
        if (validItems.length !== validCartItems.length) {
          const updatedCart = validItems.map(item => ({
            productId: item!.id,
            quantity: item!.quantity
          }))
          localStorage.setItem('electrostore_cart', JSON.stringify(updatedCart))
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }))
        }
      } else {
        setCartItems([])
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      // Clear corrupted cart data
      localStorage.removeItem('electrostore_cart')
      setCartItems([])
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }))
    } finally {
      setLoading(false)
    }
  }

  const updateCart = (updatedItems: CartItem[]) => {
    setCartItems(updatedItems)
    const cartData = updatedItems.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }))
    localStorage.setItem('electrostore_cart', JSON.stringify(cartData))
    
    // Dispatch custom event to notify other components (like header)
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cartData }))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }
    
    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    )
    updateCart(updatedItems)
  }

  const removeItem = (productId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== productId)
    updateCart(updatedItems)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Cargando carrito...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-6">
            Agregá productos a tu carrito para verlos aquí
          </p>
          <Button asChild className="btn-primary">
            <Link href="/">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-none sm:max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">Mi Carrito</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="border-border">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                {/* Mobile: Stack vertically, Desktop: Horizontal */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={getProductMainImage(item.product.id, item.product.images as string[], (item.product as any).main_image)}
                        alt={item.product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                        {item.product.description}
                      </p>
                      <p className="text-base sm:text-lg font-bold text-primary">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile: Controls at bottom, Desktop: Right side */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-col sm:items-end lg:flex-row lg:items-center">
                    <div className="flex items-center border border-border rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <span className="px-2 sm:px-3 py-1 text-sm font-medium min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-border sticky top-4">
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Productos ({getTotalItems()})</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span className="text-green-600">Gratis</span>
              </div>
              
              <hr className="border-border" />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(getTotalPrice())}</span>
              </div>
              
              <Button className="w-full btn-primary" size="lg" asChild>
                <Link href="/store/checkout">Continuar compra</Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Seguir comprando</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}