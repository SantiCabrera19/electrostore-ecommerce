'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PROVINCES } from '@/constants/provinces'
import { formatPrice } from '@/utils/formatters'

export interface CheckoutFormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  notes: string
}

interface CheckoutFormProps {
  formData: CheckoutFormData
  onInputChange: (field: keyof CheckoutFormData, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  processing: boolean
  totalPrice: number
}

export default function CheckoutForm({
  formData,
  onInputChange,
  onSubmit,
  processing,
  totalPrice
}: CheckoutFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Datos de Envío</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => onInputChange('fullName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => onInputChange('city', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="province">Provincia *</Label>
              <Select onValueChange={(value) => onInputChange('province', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postalCode">Código Postal *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => onInputChange('postalCode', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onInputChange('notes', e.target.value)}
              placeholder="Instrucciones especiales para la entrega..."
            />
          </div>

          <Button 
            type="submit" 
            className="w-full btn-primary" 
            size="lg"
            disabled={processing}
          >
            {processing ? 'Procesando...' : `Confirmar Pedido - ${formatPrice(totalPrice)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
