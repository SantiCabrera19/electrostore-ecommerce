import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configuración alternativa del cliente
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 10000
  }
})

// Cliente para crear preferencias de pago
export const preference = new Preference(client)

// Configuración para el frontend
export const MP_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!,
  locale: 'es-AR' as const,
  theme: {
    elementsColor: '#10b981', // Verde de tu tema
    headerColor: '#10b981'
  }
}

// Tipos para las preferencias
export interface PaymentItem {
  id: string
  title: string
  description?: string
  picture_url?: string
  category_id?: string
  quantity: number
  currency_id: 'ARS'
  unit_price: number
}

export interface PaymentPayer {
  name?: string
  surname?: string
  email?: string
  phone?: {
    area_code?: string
    number?: string
  }
  identification?: {
    type?: string
    number?: string
  }
  address?: {
    street_name?: string
    street_number?: string
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
  expires?: boolean
  expiration_date_from?: string
  expiration_date_to?: string
}
