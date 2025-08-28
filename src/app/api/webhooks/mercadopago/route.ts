import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Obtener el texto del body primero
    const text = await request.text()
    
    // Si el body está vacío, es una prueba de MP
    if (!text || text.trim() === '') {
      console.log('Mercado Pago test webhook received (empty body)')
      return NextResponse.json({ received: true, test: true }, { status: 200 })
    }
    
    // Parsear JSON solo si hay contenido
    const body = JSON.parse(text)
    
    // Log del webhook para debugging
    console.log('Mercado Pago Webhook received:', {
      type: body.type,
      action: body.action,
      data: body.data,
      date_created: body.date_created
    })

    // Procesar eventos de Checkout Pro
    switch (body.type) {
      case 'payment':
        console.log('Payment event:', body.data.id)
        // Aquí puedes actualizar el estado del pedido en tu base de datos
        break
      
      case 'merchant_order':
        console.log('Merchant order event:', body.data.id)
        break
      
      default:
        console.log('Unknown webhook type:', body.type)
    }

    // Mercado Pago espera una respuesta 200 para confirmar recepción
    return NextResponse.json({ received: true }, { status: 200 })
    
  } catch (error) {
    console.error('Error processing MP webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Método GET para verificación del endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Mercado Pago webhook endpoint is active (Checkout Pro)',
    timestamp: new Date().toISOString()
  })
}
