'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Home } from 'lucide-react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    // Obtener parámetros de MP
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const externalReference = searchParams.get('external_reference')
    const merchantOrderId = searchParams.get('merchant_order_id')

    setPaymentData({
      paymentId,
      status,
      externalReference,
      merchantOrderId
    })

    // Limpiar carrito después de pago exitoso
    if (status === 'approved') {
      localStorage.removeItem('electrostore_cart')
      // Disparar evento para actualizar header
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">¡Pago Exitoso!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Tu pago ha sido procesado correctamente. Recibirás un email con los detalles de tu compra.
            </p>
            
            {paymentData?.paymentId && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">ID de Pago:</p>
                <p className="text-sm text-muted-foreground">{paymentData.paymentId}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full btn-primary">
              <Link href="/store/orders">
                <Package className="w-4 h-4 mr-2" />
                Ver mis pedidos
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">Cargando...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
