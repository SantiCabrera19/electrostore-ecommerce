import { MercadoPagoConfig } from 'mercadopago'

// Configuración alternativa del cliente
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 10000
  }
})

// Configuración para Checkout API
export const MP_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!,
  locale: 'es-AR' as const,
  theme: {
    elementsColor: '#10b981',
    headerColor: '#10b981'
  }
}

// Tipos para Checkout API
export interface PaymentData {
  token: string
  transaction_amount: number
  installments: number
  payment_method_id: string
  payer: {
    email: string
    first_name?: string
    last_name?: string
    identification?: {
      type: string
      number: string
    }
  }
}

export interface PaymentResponse {
  id: number
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back'
  status_detail: string
  transaction_amount: number
  currency_id: string
  payment_method_id: string
  installments: number
  payer: {
    email: string
    first_name?: string
    last_name?: string
  }
  date_created: string
  date_approved?: string
}
