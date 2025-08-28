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
import CheckoutAPI from '@/components/payments/CheckoutAPI'
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
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')

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

      // Create order in database with customer data
      const totalPrice = getTotalPrice()
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          currency_code: 'ARS',
          subtotal: totalPrice,
          discount_total: 0,
          shipping_cost: 0,
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-none sm:max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Datos de Envío</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {/* Selector de método de pago */}
              {formData.fullName && formData.email && formData.phone && formData.address && formData.city && formData.province && formData.postalCode ? (
                <div className="space-y-4">
                  <div>
                    <Label>Método de Pago</Label>
                    <div className="grid gap-3 mt-2">
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod === 'mercadopago' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedPaymentMethod('mercadopago')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-8 bg-[#009EE3] rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">MP</span>
                          </div>
                          <div>
                            <p className="font-medium">Mercado Pago</p>
                            <p className="text-sm text-muted-foreground">Tarjetas, transferencias y más</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedPaymentMethod('transfer')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs">🏦</span>
                          </div>
                          <div>
                            <p className="font-medium">Transferencia Bancaria</p>
                            <p className="text-sm text-muted-foreground">Pago directo desde tu banco</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mostrar formulario de pago según método seleccionado */}
                  {selectedPaymentMethod === 'mercadopago' && (
                    <CheckoutAPI
                      amount={getTotalPrice()}
                      description={`Compra en ElectroStore - ${cartItems.length} producto${cartItems.length > 1 ? 's' : ''}`}
                      payer={{
                        email: formData.email,
                        first_name: formData.fullName.split(' ')[0],
                        last_name: formData.fullName.split(' ').slice(1).join(' ')
                      }}
                      onSuccess={(payment) => {
                        console.log('Payment successful:', payment)
                        clearCart()
                        alert('Pago exitoso')
                      }}
                      onError={(error) => {
                        console.error('Payment error:', error)
                        alert('Error en el pago')
                      }}
                    />
                  )}

                  {selectedPaymentMethod === 'transfer' && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Datos para Transferencia</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Banco:</strong> Banco Nación</p>
                        <p><strong>CBU:</strong> 0110599520000012345678</p>
                        <p><strong>Alias:</strong> ELECTROSTORE.PAGO</p>
                        <p><strong>Titular:</strong> ElectroStore S.A.</p>
                        <p><strong>Monto:</strong> {formatPrice(getTotalPrice())}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Enviá el comprobante por WhatsApp al +54 9 11 1234-5678
                      </p>
                    </div>
                  )}

                  {!selectedPaymentMethod && (
                    <div className="w-full p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        Seleccioná un método de pago para continuar
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Completá todos los campos obligatorios para continuar con el pago
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-3 py-2 border-b">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base line-clamp-2">{item.product!.name}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium text-sm sm:text-base">{formatPrice(item.product!.price * item.quantity)}</p>
                </div>
              </div>
            ))}
            
            <div className="pt-3 sm:pt-4 border-t">
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Métodos de Pago Disponibles</h4>
              <ul className="text-sm space-y-1">
                <li>💳 Tarjetas de crédito y débito</li>
                <li>🏦 Transferencia bancaria</li>
                <li>💰 Efectivo (Rapipago, Pago Fácil)</li>
                <li>📱 Mercado Pago y billeteras digitales</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Hasta 12 cuotas sin interés con tarjetas seleccionadas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
