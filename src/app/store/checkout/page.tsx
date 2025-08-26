'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createBrowserClient } from '@/lib/supabase'
import { getCart, clearCart } from '@/lib/cart'
import type { Tables } from '@/types/supabase'

type CartItem = {
  id: string
  product: Tables<'products'> | null
  quantity: number
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: ''
  })

  useEffect(() => {
    checkUser()
    loadCart()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      // Pre-fill form with user data
      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user.id)
        .single()
      
      if (userProfile) {
        setFormData(prev => ({
          ...prev,
          fullName: userProfile.full_name || '',
          email: userProfile.email || user.email || ''
        }))
      }
    }
  }

  const loadCart = async () => {
    try {
      const cartData = getCart()
      if (cartData.length === 0) {
        router.push('/store/cart')
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
    } finally {
      setLoading(false)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product!.price * item.quantity), 0)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      if (!user) {
        alert('Debes iniciar sesión para completar la compra')
        router.push('/auth/login')
        return
      }

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total: getTotalPrice()
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.product!.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      clearCart()

      // Redirect to success page
      router.push(`/store/order-success?order=${order.id}`)

    } catch (error) {
      console.error('Error processing order:', error)
      alert('Error al procesar la orden. Intenta nuevamente.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle>Datos de Envío</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nombre completo *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="province">Provincia *</Label>
                  <Select onValueChange={(value) => handleInputChange('province', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buenos-aires">Buenos Aires</SelectItem>
                      <SelectItem value="cordoba">Córdoba</SelectItem>
                      <SelectItem value="santa-fe">Santa Fe</SelectItem>
                      <SelectItem value="mendoza">Mendoza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postalCode">Código Postal *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Instrucciones especiales para la entrega..."
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary" 
                size="lg"
                disabled={processing}
              >
                {processing ? 'Procesando...' : `Confirmar Pedido - ${formatPrice(getTotalPrice())}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b">
                <div className="flex-1">
                  <h4 className="font-medium">{item.product!.name}</h4>
                  <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.product!.price * item.quantity)}</p>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Métodos de Pago</h4>
              <ul className="text-sm space-y-1">
                <li>💳 Tarjeta de crédito/débito</li>
                <li>🏦 Transferencia bancaria</li>
                <li>💰 Efectivo contra entrega</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
