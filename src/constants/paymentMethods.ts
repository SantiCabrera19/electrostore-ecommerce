/**
 * Payment methods configuration
 */

export interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
  enabled: boolean
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'credit-card',
    name: 'Tarjeta de crédito/débito',
    icon: '💳',
    description: 'Visa, Mastercard, American Express',
    enabled: true
  },
  {
    id: 'bank-transfer',
    name: 'Transferencia bancaria',
    icon: '🏦',
    description: 'Transferencia directa a cuenta bancaria',
    enabled: true
  },
  {
    id: 'cash-on-delivery',
    name: 'Efectivo contra entrega',
    icon: '💰',
    description: 'Pago en efectivo al recibir el producto',
    enabled: true
  },
  {
    id: 'mercado-pago',
    name: 'Mercado Pago',
    icon: '💙',
    description: 'Pago seguro con Mercado Pago',
    enabled: false // Will be enabled when implemented
  }
]

export function getEnabledPaymentMethods(): PaymentMethod[] {
  return PAYMENT_METHODS.filter(method => method.enabled)
}

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find(method => method.id === id)
}
