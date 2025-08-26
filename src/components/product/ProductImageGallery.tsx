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
    <div className="space-y-3 sm:space-y-4">
      {/* Mobile: Main image first, thumbnails below */}
      <Card className="border-border lg:hidden">
        <CardContent className="p-0 relative">
          <img
            src={images[currentImageIndex]}
            alt={productName}
            className="w-full h-64 sm:h-80 object-contain bg-gray-50 rounded-lg p-4 sm:p-6"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white h-8 w-8 p-0"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white h-8 w-8 p-0"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                      idx === currentImageIndex ? 'bg-primary' : 'bg-white/60 hover:bg-white/80'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mobile: Horizontal thumbnail scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:hidden">
        {images.map((src: string, idx: number) => (
          <div 
            key={idx} 
            className={`flex-shrink-0 relative overflow-hidden rounded-md border transition-all cursor-pointer ${
              idx === currentImageIndex ? 'border-primary border-2' : 'border-border'
            }`}
            onClick={() => setCurrentImageIndex(idx)}
          >
            <img 
              src={src} 
              alt={`Miniatura ${idx + 1}`} 
              className="h-12 w-12 sm:h-16 sm:w-16 object-contain bg-gray-50 p-1" 
            />
          </div>
        ))}
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden lg:grid grid-cols-5 gap-4">
        <div className="col-span-1 flex flex-col gap-2">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
