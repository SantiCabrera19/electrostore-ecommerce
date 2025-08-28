import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verificar que tenemos el access token
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Mercado Pago access token not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { token, transaction_amount, installments, payment_method_id, payer } = body

    // Validar datos requeridos
    if (!token || !transaction_amount || !payer?.email) {
      return NextResponse.json(
        { error: 'Missing required fields: token, transaction_amount, payer.email' },
        { status: 400 }
      )
    }

    // Crear pago con Checkout API
    const paymentData = {
      transaction_amount: parseFloat(transaction_amount),
      token,
      description: "Compra en ElectroStore",
      installments: installments || 1,
      payment_method_id,
      payer: {
        email: payer.email,
        first_name: payer.first_name,
        last_name: payer.last_name,
        identification: payer.identification
      }
    }

    console.log('Creating payment with Checkout API:', { 
      amount: paymentData.transaction_amount,
      method: payment_method_id,
      installments: paymentData.installments
    })

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paymentData)
    })

    const paymentResult = await response.json()

    if (!response.ok) {
      console.error('Payment creation failed:', paymentResult)
      return NextResponse.json(
        { error: 'Payment creation failed', details: paymentResult },
        { status: response.status }
      )
    }

    console.log('Payment created successfully:', {
      id: paymentResult.id,
      status: paymentResult.status,
      status_detail: paymentResult.status_detail
    })

    return NextResponse.json(paymentResult)

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
