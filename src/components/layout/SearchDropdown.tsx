'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { getProductMainImage } from '@/lib/images'
import type { Tables } from '@/types/supabase'

type Product = Tables<'products'>

interface SearchDropdownProps {
  query: string
  isVisible: boolean
  onClose: () => void
}

export default function SearchDropdown({ query, isVisible, onClose }: SearchDropdownProps) {
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Tables<'categories'>[]>([])
  const supabase = createBrowserClient()
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose])

  const handleProductClick = () => {
    onClose()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (!isVisible) return null

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
    >
      {isLoading && (
        <div className="p-4 text-center text-gray-500">
          Buscando productos...
        </div>
      )}

      {!isLoading && query.trim().length >= 2 && results.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No se encontraron productos para "{query}"
        </div>
      )}

      {!isLoading && query.trim().length < 2 && (
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorías populares</h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.id}`}
                onClick={onClose}
                className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
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
                className="flex items-center p-3 hover:bg-gray-50 transition-colors"
              >
                {/* Product Image */}
                <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>

                {/* Product Info */}
                <div className="ml-3 flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate text-sm">
                    {product.name}
                  </h4>
                  
                  {/* Price */}
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="font-bold text-primary text-sm">
                      {formatPrice(product.price)}
                    </span>
                    {hasOffer && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(compareAtPrice)}
                        </span>
                        <span className="text-xs bg-red-600 text-white px-1 py-0.5 rounded">
                          -{discountPercentage}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="ml-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {results.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Mostrando {results.length} resultado{results.length !== 1 ? 's' : ''}
            {results.length === 8 && ' (máximo 8)'}
          </p>
        </div>
      )}
    </div>
  )
}
