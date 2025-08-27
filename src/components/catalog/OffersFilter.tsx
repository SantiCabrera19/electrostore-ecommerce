"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Tag } from "lucide-react"

interface OffersFilterProps {
  onOffersToggle: (showOnlyOffers: boolean) => void
  showOnlyOffers: boolean
  offersCount: number
}

export default function OffersFilter({ onOffersToggle, showOnlyOffers, offersCount }: OffersFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Card className="border-border">
      <CardHeader 
        className="pb-2 lg:pb-3 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-xs lg:text-sm font-semibold">
          <div className="flex items-center gap-1.5">
            <Tag className="h-3 w-3 lg:h-4 lg:w-4" />
            OFERTAS
          </div>
          {isExpanded ? <ChevronUp className="h-3 w-3 lg:h-4 lg:w-4" /> : <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />}
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 px-3 lg:px-6 pb-3 lg:pb-6">
          <div className="space-y-2 lg:space-y-3">
            <div className="text-center">
              <span className="text-xs lg:text-sm text-primary font-medium">
                {offersCount} productos en oferta
              </span>
            </div>
            
            <Button 
              variant={showOnlyOffers ? "default" : "outline"}
              size="sm" 
              onClick={() => onOffersToggle(!showOnlyOffers)}
              className={`w-full text-xs h-6 lg:h-8 font-medium ${
                showOnlyOffers 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "border-red-300 text-red-600 hover:bg-red-50"
              }`}
            >
              {showOnlyOffers ? "MOSTRAR TODOS" : "SOLO OFERTAS"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
