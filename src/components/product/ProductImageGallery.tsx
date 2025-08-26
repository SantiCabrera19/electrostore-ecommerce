"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="col-span-1 flex lg:flex-col gap-2">
        {images.map((src: string, idx: number) => (
          <div 
            key={idx} 
            className={`relative overflow-hidden rounded-md border transition-all cursor-pointer ${
              idx === currentImageIndex ? 'border-primary border-2' : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setCurrentImageIndex(idx)}
          >
            <img 
              src={src} 
              alt={`Miniatura ${idx + 1}`} 
              className="h-16 w-16 object-contain bg-gray-50 p-1" 
            />
          </div>
        ))}
      </div>
      
      <Card className="col-span-4 border-border">
        <CardContent className="p-0 relative">
          <img
            src={images[currentImageIndex]}
            alt={productName}
            className="w-full h-[420px] object-contain bg-gray-50 rounded-lg p-8"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    idx === currentImageIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
