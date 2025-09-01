'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Star } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  mainImage: string
  onChange: (images: string[], mainImage: string) => void
}

export default function ImageUploader({ images, mainImage, onChange }: ImageUploaderProps) {
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingMain(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      const url: string | undefined = data?.url
      if (!url) throw new Error('No URL returned by upload')
      onChange(images, url)
    } catch (err) {
      console.error(err)
      alert('Error al subir la imagen principal')
    } finally {
      setUploadingMain(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingGallery(true)
    try {
      const uploads = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        const url: string | undefined = data?.url
        if (!url) throw new Error('No URL returned by upload')
        return url
      })
      const newImages = await Promise.all(uploads)
      const cleaned = newImages.filter(Boolean)
      onChange([...images, ...cleaned], mainImage || '')
    } catch (err) {
      console.error(err)
      alert('Error al subir las imágenes de galería')
    } finally {
      setUploadingGallery(false)
    }
  }

  const removeImage = (imageToRemove: string) => {
    const updated = images.filter((img) => img !== imageToRemove)
    const newMain = mainImage === imageToRemove ? (updated[0] || '') : mainImage
    onChange(updated, newMain)
  }

  const setAsMainImage = (image: string) => {
    const idx = images.indexOf(image)
    if (idx === -1) {
      onChange(images, image)
      return
    }
    const reordered = [image, ...images.filter((_, i) => i !== idx)]
    onChange(reordered, image)
  }

  return (
    <div>
      <Label>Imágenes del producto</Label>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium mb-2">Imagen principal</p>
          <div className="flex items-center gap-3">
            <input
              id="main-image-upload"
              type="file"
              accept="image/*"
              onChange={handleMainUpload}
              className="hidden"
              disabled={uploadingMain}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('main-image-upload')?.click()}
              disabled={uploadingMain}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadingMain ? 'Subiendo...' : mainImage ? 'Cambiar principal' : 'Subir principal'}
            </Button>
            {mainImage ? (
              <div className="relative border rounded overflow-hidden">
                <img
                  src={mainImage.startsWith('http') ? mainImage : `/${mainImage.replace(/^\/+/, '')}`}
                  alt="Principal"
                  className="w-24 h-24 object-cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white/80 rounded p-1"
                  onClick={() => onChange(images, '')}
                  title="Quitar principal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Galería</p>
          <div className="flex items-center gap-2">
            <input
              id="gallery-image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
              disabled={uploadingGallery}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('gallery-image-upload')?.click()}
              disabled={uploadingGallery}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadingGallery ? 'Subiendo...' : 'Subir a galería'}
            </Button>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className={`relative border-2 rounded-lg overflow-hidden ${image === mainImage ? 'border-primary' : 'border-muted'}`}>
                    <img
                      src={image && image.startsWith('http') ? image : `/${(image || '').replace(/^\/+/, '')}`}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    {image === mainImage ? (
                      <div className="absolute top-1 left-1">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                      </div>
                    ) : null}
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
                  {/* Se eliminó la acción de marcar como principal desde la galería */}
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No hay imágenes subidas. Usa los botones para agregar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
