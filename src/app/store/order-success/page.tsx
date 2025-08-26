'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Truck, CreditCard, Download } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { generateInvoicePDF } from '@/lib/pdf-generator'

function OrderSuccessContent() {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const supabase = createBrowserClient()

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    if (!orderId) {
      setLoading(false)
      return
    }

    try {
      const { data: orderData } = await supabase
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

      setOrder(orderData)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = () => {
    if (!order) return

    // Mock customer data - in real app, this would come from the order
    const customerData = {
      fullName: 'Cliente ElectroStore',
      email: 'cliente@email.com',
      phone: '+54 11 1234-5678',
      address: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      province: 'Buenos Aires',
      postalCode: '1043'
    }

    generateInvoicePDF(order, customerData)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Orden no encontrada</h2>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">¡Pedido Confirmado!</h1>
          <p className="text-muted-foreground">
            Tu pedido ha sido recibido y está siendo procesado
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalles del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Número de Orden</p>
                <p className="font-mono font-medium">#{order.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-bold text-lg text-primary">{formatPrice(order.total)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <h4 className="font-medium">{item.products.name}</h4>
                    <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Próximos Pasos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Confirmación por Email</h4>
                  <p className="text-sm text-muted-foreground">
                    Recibirás un email con los detalles de tu pedido en los próximos minutos
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Preparación</h4>
                  <p className="text-sm text-muted-foreground">
                    Preparamos tu pedido en 1-2 días hábiles
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Envío</h4>
                  <p className="text-sm text-muted-foreground">
                    Tu pedido será enviado y recibirás el código de seguimiento
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Pago Pendiente</h4>
              <p className="text-sm text-yellow-700">
                Este es un pedido simulado. En una implementación real, aquí aparecerían 
                las instrucciones de pago según el método seleccionado.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownloadInvoice} className="bg-teal-600 hover:bg-teal-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Descargar Factura
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Seguir Comprando</Link>
          </Button>
          <Button asChild>
            <Link href="/store/cart">Ver Carrito</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
