"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Tables } from '@/types/supabase'

type Product = Tables<'products'>

interface PriceFilterProps {
  products: Product[]
  onPriceChange: (min: number, max: number) => void
  filteredCount: number
}

export default function PriceFilter({ products, onPriceChange, filteredCount }: PriceFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(0)

  // Calcular rango de precios de los productos
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      
      setMinPrice(min)
      setMaxPrice(max)
      setMinValue(min)
      setMaxValue(max)
    }
  }, [products])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value <= maxValue) {
      setMinValue(value)
    }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value >= minValue) {
      setMaxValue(value)
    }
  }

  const handleApply = () => {
    onPriceChange(minValue, maxValue)
  }

  const handleReset = () => {
    setMinValue(minPrice)
    setMaxValue(maxPrice)
    // Llamar con valores que indiquen "sin filtro"
    onPriceChange(0, Infinity)
  }

  if (products.length === 0) return null

  return (
    <Card className="border-border">
      <CardHeader 
        className="pb-2 lg:pb-3 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-xs lg:text-sm font-semibold">
          PRECIO
          {isExpanded ? <ChevronUp className="h-3 w-3 lg:h-4 lg:w-4" /> : <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />}
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 px-3 lg:px-6 pb-3 lg:pb-6">
          <div className="space-y-2 lg:space-y-4">
            {/* Inputs de precio */}
            <div className="grid grid-cols-2 gap-2 lg:gap-4 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground text-xs mb-1">Mínimo</div>
                <div className="font-semibold text-foreground text-xs lg:text-sm">
                  {formatPrice(minValue)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-xs mb-1">Máximo</div>
                <div className="font-semibold text-foreground text-xs lg:text-sm">
                  {formatPrice(maxValue)}
                </div>
              </div>
            </div>

            {/* Slider dual */}
            <div className="relative px-1">
              <div className="relative h-1.5 lg:h-2 bg-muted rounded-full">
                {/* Track activo */}
                <div 
                  className="absolute h-1.5 lg:h-2 bg-primary rounded-full"
                  style={{
                    left: `${((minValue - minPrice) / (maxPrice - minPrice)) * 100}%`,
                    width: `${((maxValue - minValue) / (maxPrice - minPrice)) * 100}%`
                  }}
                />
                
                {/* Slider mínimo */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={minValue}
                  onChange={handleMinChange}
                  className="absolute w-full h-1.5 lg:h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                  style={{ zIndex: 1 }}
                />
                
                {/* Slider máximo */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={maxValue}
                  onChange={handleMaxChange}
                  className="absolute w-full h-1.5 lg:h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                  style={{ zIndex: 2 }}
                />
              </div>
            </div>

            {/* Contador y botones */}
            <div className="space-y-2 lg:space-y-3 pt-1 lg:pt-2">
              <div className="text-center">
                <span className="text-xs lg:text-sm text-primary font-medium">
                  {filteredCount} productos
                </span>
              </div>
              
              <div className="flex gap-1.5 lg:gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="flex-1 text-xs h-6 lg:h-8 border-gray-300 hover:bg-gray-50 px-2"
                >
                  Limpiar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApply}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs h-6 lg:h-8 font-medium px-2"
                >
                  APLICAR
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ff6b35;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ff6b35;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </Card>
  )
}
