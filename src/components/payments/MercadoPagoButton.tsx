'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PaymentItem {
  id: string
  title: string
  description?: string
  quantity: number
  currency_id: 'ARS'
  unit_price: number
}

interface PaymentPayer {
  name?: string
  surname?: string
  email?: string
  phone?: {
    number?: string
  }
  address?: {
    street_name?: string
    zip_code?: string
  }
}

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

  const handlePayment = async () => {
    if (loading || disabled) return

    setLoading(true)

    try {
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

      onSuccess?.(data.id)

      // Redirigir a Mercado Pago
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
      
      alert(`Error en el pago: ${errorMessage}`)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading || disabled}
      className={`w-full bg-[#00B1EA] hover:bg-[#009EE3] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Procesando...</span>
        </>
      ) : (
        <>
          {/* Logo oficial de Mercado Pago */}
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 100 100" 
            className="flex-shrink-0"
          >
            <circle cx="50" cy="50" r="45" fill="white" />
            <path 
              fill="#00B1EA" 
              d="M50 10c22.091 0 40 17.909 40 40S72.091 90 50 90 10 72.091 10 50 27.909 10 50 10zm0 8c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z"
            />
            <path 
              fill="#00B1EA" 
              d="M35 35h15v30H35zm15 0h15v15H50z"
            />
          </svg>
          <span className="text-lg">Pagar con Mercado Pago</span>
          
          {/* Iconos de métodos de pago */}
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-6 h-4 bg-white rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-800">💳</span>
            </div>
            <div className="w-6 h-4 bg-white rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-800">🏦</span>
            </div>
          </div>
        </>
      )}
    </button>
  )
}
