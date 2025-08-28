import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Test directo con fetch (sin SDK)
    const testData = {
      items: [
        {
          title: "Test Product",
          quantity: 1,
          unit_price: 100,
          currency_id: "ARS"
        }
      ],
      back_urls: {
        success: "http://localhost:3000/store/payment/success",
        failure: "http://localhost:3000/store/payment/failure",
        pending: "http://localhost:3000/store/payment/pending"
      },
      auto_return: "approved"
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify(testData)
    })

    console.log('Direct API response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.log('Direct API error:', errorData)
      return NextResponse.json({ error: 'Direct API failed', details: errorData }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Test MP error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}
