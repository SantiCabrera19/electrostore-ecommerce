import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configuración del cliente
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  }
})

const preference = new Preference(client)

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Mercado Pago access token not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()

    // Validar que tenemos items
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    // Configurar URLs de retorno
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const preferenceData = {
      items: body.items,
      payer: body.payer,
      back_urls: {
        success: `${baseUrl}/store/payment/success`,
        failure: `${baseUrl}/store/payment/failure`,
        pending: `${baseUrl}/store/payment/pending`
      },
      auto_return: 'approved' as const,
      external_reference: body.external_reference || `order_${Date.now()}`,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      expires: false,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    }

    const response = await preference.create({ body: preferenceData })

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    })

  } catch (error) {
    console.error('Error creating MP preference:', error)
    
    return NextResponse.json(
      { error: 'Failed to create payment preference' },
      { status: 500 }
    )
  }
}
