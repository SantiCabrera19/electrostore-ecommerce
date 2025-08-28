import { NextRequest, NextResponse } from 'next/server'
import { preference, type CreatePreferenceData } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    // Verificar que tenemos el token
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Mercado Pago access token not configured' },
        { status: 500 }
      )
    }

    // Debug: verificar token en producción
    console.log('MP Token exists:', !!process.env.MERCADOPAGO_ACCESS_TOKEN)
    console.log('MP Token prefix:', process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 8))
    console.log('MP Token length:', process.env.MERCADOPAGO_ACCESS_TOKEN?.length)

    const body: CreatePreferenceData = await request.json()

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
      external_reference: body.external_reference,
      notification_url: body.notification_url,
      expires: false,
      // Configuración adicional
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12 // Máximo 12 cuotas
      },
      shipments: {
        mode: 'not_specified'
      }
    }

    // Debug: mostrar datos que enviamos
    console.log('Preference data:', JSON.stringify(preferenceData, null, 2))
    
    // Crear preferencia en Mercado Pago
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
