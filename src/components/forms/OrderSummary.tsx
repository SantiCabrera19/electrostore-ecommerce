'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/utils/formatters'
import { getEnabledPaymentMethods } from '@/constants/paymentMethods'
import type { CartItem } from '@/hooks/useCart'

interface OrderSummaryProps {
  cartItems: CartItem[]
  totalPrice: number
}

export default function OrderSummary({ cartItems, totalPrice }: OrderSummaryProps) {
  const paymentMethods = getEnabledPaymentMethods()

  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start gap-3 py-2 border-b">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm sm:text-base line-clamp-2">{item.product!.name}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-medium text-sm sm:text-base">{formatPrice(item.product!.price * item.quantity)}</p>
            </div>
          </div>
        ))}
        
        <div className="pt-3 sm:pt-4 border-t">
          <div className="flex justify-between text-base sm:text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Métodos de Pago</h4>
          <ul className="text-sm space-y-1">
            {paymentMethods.map((method) => (
              <li key={method.id}>
                {method.icon} {method.name}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
