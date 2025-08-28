'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ShoppingCart, Home } from 'lucide-react'

function PaymentFailureContent() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const externalReference = searchParams.get('external_reference')

    setPaymentData({
      paymentId,
      status,
      externalReference
    })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Pago Rechazado</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              No pudimos procesar tu pago. Por favor, verificá tus datos e intentá nuevamente.
            </p>
            
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-800">
                Posibles causas: fondos insuficientes, datos incorrectos o problemas con la tarjeta.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full btn-primary">
              <Link href="/store/cart">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Volver al carrito
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

export default function PaymentFailurePage() {
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
      <PaymentFailureContent />
    </Suspense>
  )
}
