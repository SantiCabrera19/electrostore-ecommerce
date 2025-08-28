'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import type { PaymentItem, PaymentPayer } from '@/lib/mercadopago'

interface MercadoPagoButtonProps {
  items: PaymentItem[]
  payer?: PaymentPayer
  onSuccess?: (preferenceId: string) => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
}

export default function MercadoPagoButton({
  items,
  payer,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}: MercadoPagoButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    if (loading || disabled) return

    setLoading(true)

    try {
      // Crear preferencia de pago
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          payer,
          external_reference: `order_${Date.now()}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear la preferencia de pago')
      }

      const data = await response.json()

      // Callback de éxito
      onSuccess?.(data.id)

      // Redirigir a Mercado Pago
      // En desarrollo usa sandbox_init_point, en producción init_point
      const redirectUrl = process.env.NODE_ENV === 'development' 
        ? data.sandbox_init_point 
        : data.init_point

      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        throw new Error('No se pudo obtener la URL de pago')
      }

    } catch (error) {
      console.error('Error creating payment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      toast({
        title: 'Error en el pago',
        description: errorMessage,
        variant: 'destructive',
      })

      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || disabled}
      className={`w-full bg-[#009EE3] hover:bg-[#0084C7] text-white font-semibold py-3 px-6 rounded-lg transition-colors ${className}`}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pagar con Mercado Pago
        </>
      )}
    </Button>
  )
}
