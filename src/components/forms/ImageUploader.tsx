'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Star } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  mainImage: string
  onChange: (images: string[], mainImage: string) => void
}

export default function ImageUploader({ images, mainImage, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Upload failed')
        
        const data = await response.json()
        return data.filename
      })

      const newImages = await Promise.all(uploadPromises)
      const updatedImages = [...images, ...newImages]
      const newMainImage = mainImage || newImages[0] || ''
      
      onChange(updatedImages, newMainImage)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Error al subir las imágenes')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (imageToRemove: string) => {
    const updatedImages = images.filter(img => img !== imageToRemove)
    const newMainImage = mainImage === imageToRemove 
      ? (updatedImages[0] || '') 
      : mainImage
    
    onChange(updatedImages, newMainImage)
  }

  const setAsMainImage = (image: string) => {
    onChange(images, image)
  }

  return (
    <div>
      <Label>Imágenes del producto</Label>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Subiendo...' : 'Subir Imágenes'}
          </Button>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className={`relative border-2 rounded-lg overflow-hidden ${
                  image === mainImage ? 'border-primary' : 'border-muted'
                }`}>
                  <img
                    src={`/${image}`}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  
                  {image === mainImage && (
                    <div className="absolute top-1 left-1">
                      <Star className="h-4 w-4 text-primary fill-primary" />
                    </div>
                  )}
                  
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(image)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant={image === mainImage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAsMainImage(image)}
                  className="w-full mt-1 text-xs"
                >
                  {image === mainImage ? 'Principal' : 'Marcar como principal'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No hay imágenes subidas. Haz clic en "Subir Imágenes" para agregar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
