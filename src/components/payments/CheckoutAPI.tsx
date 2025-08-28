'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CreditCard } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { MP_CONFIG, type PaymentData, type PaymentResponse } from '@/lib/mercadopago'

declare global {
  interface Window {
    MercadoPago: any
  }
}

interface CheckoutAPIProps {
  amount: number
  description: string
  payer: {
    email: string
    first_name?: string
    last_name?: string
  }
  onSuccess?: (payment: PaymentResponse) => void
  onError?: (error: string) => void
}

export default function CheckoutAPI({ amount, description, payer, onSuccess, onError }: CheckoutAPIProps) {
  const [loading, setLoading] = useState(false)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [mp, setMp] = useState<any>(null)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [installments, setInstallments] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    cardholderName: '',
    docType: 'DNI',
    docNumber: '',
    installments: 1,
    paymentMethodId: ''
  })

  const { toast } = useToast()

  // Cargar SDK de MercadoPago
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.onload = () => {
      const mercadopago = new window.MercadoPago(MP_CONFIG.publicKey, {
        locale: MP_CONFIG.locale
      })
      setMp(mercadopago)
      setSdkLoaded(true)
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Obtener métodos de pago cuando cambia el número de tarjeta
  useEffect(() => {
    if (mp && formData.cardNumber.length >= 6) {
      mp.getPaymentMethods({
        bin: formData.cardNumber.substring(0, 6)
      }).then((response: any) => {
        if (response.results.length > 0) {
          const paymentMethod = response.results[0]
          setFormData(prev => ({ ...prev, paymentMethodId: paymentMethod.id }))
          setPaymentMethods(response.results)
          
          // Obtener cuotas disponibles
          mp.getInstallments({
            amount: amount.toString(),
            bin: formData.cardNumber.substring(0, 6),
            payment_type_id: paymentMethod.payment_type_id
          }).then((installmentsResponse: any) => {
            if (installmentsResponse.results.length > 0) {
              setInstallments(installmentsResponse.results[0].payer_costs)
            }
          })
        }
      }).catch((error: any) => {
        console.error('Error getting payment methods:', error)
      })
    }
  }, [mp, formData.cardNumber, amount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !mp) return

    setLoading(true)

    try {
      // Crear token de tarjeta
      const cardToken = await mp.createCardToken({
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        securityCode: formData.securityCode,
        expirationMonth: formData.expirationDate.split('/')[0],
        expirationYear: formData.expirationDate.split('/')[1],
        cardholderName: formData.cardholderName,
        identificationType: formData.docType,
        identificationNumber: formData.docNumber
      })

      if (cardToken.error) {
        throw new Error(cardToken.error.message)
      }

      // Enviar pago al backend
      const paymentData: PaymentData = {
        token: cardToken.id,
        transaction_amount: amount,
        installments: formData.installments,
        payment_method_id: formData.paymentMethodId,
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: {
            type: formData.docType,
            number: formData.docNumber
          }
        }
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Error al procesar el pago')
      }

      const paymentResult: PaymentResponse = await response.json()

      // Manejar resultado del pago
      if (paymentResult.status === 'approved') {
        toast({
          title: 'Pago aprobado',
          description: 'Tu pago se procesó correctamente',
          variant: 'success',
        })
        onSuccess?.(paymentResult)
      } else if (paymentResult.status === 'pending') {
        toast({
          title: 'Pago pendiente',
          description: 'Tu pago está siendo procesado',
          variant: 'default',
        })
        onSuccess?.(paymentResult)
      } else {
        throw new Error(`Pago ${paymentResult.status}: ${paymentResult.status_detail}`)
      }

    } catch (error) {
      console.error('Error processing payment:', error)
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

  if (!sdkLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando formulario de pago...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Resumen del pago</h3>
        <p className="text-lg font-bold">${amount.toLocaleString('es-AR')}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">Número de tarjeta</Label>
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
              setFormData(prev => ({ ...prev, cardNumber: value }))
            }}
            maxLength={19}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expirationDate">Vencimiento</Label>
            <Input
              id="expirationDate"
              type="text"
              placeholder="MM/YY"
              value={formData.expirationDate}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
                setFormData(prev => ({ ...prev, expirationDate: value }))
              }}
              maxLength={5}
              required
            />
          </div>
          <div>
            <Label htmlFor="securityCode">Código de seguridad</Label>
            <Input
              id="securityCode"
              type="text"
              placeholder="123"
              value={formData.securityCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setFormData(prev => ({ ...prev, securityCode: value }))
              }}
              maxLength={4}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cardholderName">Nombre del titular</Label>
          <Input
            id="cardholderName"
            type="text"
            placeholder="Nombre completo"
            value={formData.cardholderName}
            onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="docType">Tipo de documento</Label>
            <Select value={formData.docType} onValueChange={(value) => setFormData(prev => ({ ...prev, docType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DNI">DNI</SelectItem>
                <SelectItem value="CUIL">CUIL</SelectItem>
                <SelectItem value="CUIT">CUIT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="docNumber">Número de documento</Label>
            <Input
              id="docNumber"
              type="text"
              placeholder="12345678"
              value={formData.docNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setFormData(prev => ({ ...prev, docNumber: value }))
              }}
              required
            />
          </div>
        </div>

        {installments.length > 0 && (
          <div>
            <Label htmlFor="installments">Cuotas</Label>
            <Select 
              value={formData.installments.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, installments: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {installments.map((installment) => (
                  <SelectItem key={installment.installments} value={installment.installments.toString()}>
                    {installment.installments}x ${installment.installment_amount.toLocaleString('es-AR')}
                    {installment.installment_rate > 0 && ` (${installment.installment_rate}% CFT)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#009EE3] hover:bg-[#0084C7] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pagar ${amount.toLocaleString('es-AR')}
          </>
        )}
      </Button>
    </form>
  )
}
