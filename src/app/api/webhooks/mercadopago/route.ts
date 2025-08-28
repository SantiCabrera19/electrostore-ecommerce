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

    // Procesar eventos de Checkout API
    switch (body.type) {
      case 'payment':
        if (body.action === 'payment.created' || body.action === 'payment.updated') {
          console.log(`Payment ${body.action}:`, body.data.id)
          
          // Aquí puedes obtener los detalles del pago si necesitas
          // const paymentId = body.data.id
          // const paymentDetails = await getPaymentDetails(paymentId)
          
          // Actualizar estado del pedido en tu base de datos
          // await updateOrderStatus(paymentId, paymentDetails.status)
        }
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
    message: 'Mercado Pago webhook endpoint is active (Checkout API)',
    timestamp: new Date().toISOString()
  })
}
