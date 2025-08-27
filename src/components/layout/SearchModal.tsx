'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { getProductMainImage } from '@/lib/images'
import type { Tables } from '@/types/supabase'

type Product = Tables<'products'>

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Tables<'categories'>[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserClient()

  // Sync with header input
  useEffect(() => {
    if (isOpen) {
      const headerInput = document.querySelector('input[type="search"]') as HTMLInputElement
      if (headerInput && headerInput.value) {
        setQuery(headerInput.value)
      }
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [isOpen])

  // Load categories for suggestions
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('categories').select('*')
      if (data) setCategories(data)
    }
    loadCategories()
  }, [supabase])

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(8)
          .order('created_at', { ascending: false })

        setResults(data || [])
      } catch (error) {
        console.error('Error searching products:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, supabase])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleProductClick = () => {
    setQuery('')
    setResults([])
    onClose()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar productos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg outline-none placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="ml-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-8 text-center text-gray-500">
              Buscando productos...
            </div>
          )}

          {!isLoading && query.trim().length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No se encontraron productos para "{query}"
            </div>
          )}

          {!isLoading && query.trim().length < 2 && (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorías populares</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    href={`/?category=${category.id}`}
                    onClick={onClose}
                    className="p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="divide-y divide-gray-100">
              {results.map((product) => {
                const image = getProductMainImage(product.id, product.images as string[], (product as any).main_image)
                const compareAtPrice = (product as any).compare_at_price
                const hasOffer = compareAtPrice && compareAtPrice > product.price
                const discountPercentage = hasOffer ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100) : 0

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleProductClick}
                    className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="64px"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="ml-4 flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {product.description}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="font-bold text-lg text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {hasOffer && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(compareAtPrice)}
                            </span>
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                              -{discountPercentage}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="ml-4 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Mostrando {results.length} resultado{results.length !== 1 ? 's' : ''}
              {results.length === 8 && ' (máximo 8)'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
