import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configuración del cliente
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  }
})

// Cliente para crear preferencias de pago
export const preference = new Preference(client)

// Tipos para las preferencias
export interface PaymentItem {
  id: string
  title: string
  description?: string
  quantity: number
  currency_id: 'ARS'
  unit_price: number
}

export interface PaymentPayer {
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

export interface CreatePreferenceData {
  items: PaymentItem[]
  payer?: PaymentPayer
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: 'approved' | 'all'
  external_reference?: string
  notification_url?: string
}

