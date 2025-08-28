'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
// import { toast } from 'sonner'
import { PaymentItem, PaymentPayer } from '@/lib/mercadopago'

interface MercadoPagoRedirectProps {
  items: PaymentItem[]
  payer: PaymentPayer
  disabled?: boolean
}

export default function MercadoPagoRedirect({
  items,
  payer,
  disabled = false
}: MercadoPagoRedirectProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (loading || disabled) return

    setLoading(true)

    try {
      // Crear formulario dinámico para enviar a MP
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://www.mercadopago.com.ar/checkout/v1/redirect'
      form.target = '_blank'

      // Datos básicos
      const fields: Record<string, string> = {
        'external_reference': `order_${Date.now()}`,
        'notification_url': `${window.location.origin}/api/webhooks/mercadopago`,
        'back_urls[success]': `${window.location.origin}/store/payment/success`,
        'back_urls[failure]': `${window.location.origin}/store/payment/failure`,
        'back_urls[pending]': `${window.location.origin}/store/payment/pending`,
        'auto_return': 'approved',
        'payer[name]': payer.name || '',
        'payer[surname]': payer.surname || '',
        'payer[email]': payer.email || '',
        'payer[phone][area_code]': payer.phone?.area_code || '',
        'payer[phone][number]': payer.phone?.number || '',
        'payer[address][street_name]': payer.address?.street_name || '',
        'payer[address][street_number]': payer.address?.street_number || '',
        'payer[address][zip_code]': payer.address?.zip_code || ''
      }

      // Agregar items
      items.forEach((item, index) => {
        fields[`items[${index}][id]`] = item.id
        fields[`items[${index}][title]`] = item.title
        fields[`items[${index}][description]`] = item.description || ''
        fields[`items[${index}][quantity]`] = item.quantity.toString()
        fields[`items[${index}][unit_price]`] = item.unit_price.toString()
        fields[`items[${index}][currency_id]`] = item.currency_id
      })

      // Crear campos del formulario
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      // Enviar formulario
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)

      console.log("Redirigiendo a Mercado Pago")

    } catch (error) {
      console.error('Error al procesar pago:', error)
      console.error("No se pudo procesar el pago. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
      size="lg"
    >
      {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
    </Button>
  )
}
