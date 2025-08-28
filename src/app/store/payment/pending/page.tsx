'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Package, Home } from 'lucide-react'

export default function PaymentPendingPage() {
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
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl text-yellow-600">Pago Pendiente</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Tu pago está siendo procesado. Te notificaremos cuando se confirme.
            </p>
            
            {paymentData?.paymentId && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">ID de Pago:</p>
                <p className="text-sm text-muted-foreground">{paymentData.paymentId}</p>
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mt-4">
              <p className="text-sm text-yellow-800">
                Los pagos en efectivo pueden tardar hasta 3 días hábiles en acreditarse.
              </p>
            </div>
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
