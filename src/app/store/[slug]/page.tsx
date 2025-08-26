"use client"

import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAllProductImages } from "@/lib/images"
import ProductImageGallery from "@/components/product/ProductImageGallery"
import ProductInfo from "@/components/product/ProductInfo"
import ProductSpecs from "@/components/product/ProductSpecs"

type PageProps = {
  params: { slug: string }
  searchParams: { id?: string }
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export default function ProductDetailPage({ params, searchParams }: PageProps) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState<string | undefined>()
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        let productData = null

        if (searchParams.id) {
          const { data, error } = await supabase
            .from("products")
            .select("id, name, description, price, images, specs, category_id")
            .eq("id", searchParams.id)
            .single()

          if (data && !error) {
            productData = data
          }
        }

        if (!productData) {
          const { data: products, error: slugError } = await supabase
            .from("products")
            .select("id, name, description, price, images, specs, category_id")

          if (!slugError && products) {
            productData = products.find((p: any) => toSlug(p.name) === params.slug)
          }
        }

        if (!productData) {
          router.push('/404')
          return
        }

        setProduct(productData)

        if (productData.category_id) {
          const { data: cat } = await supabase
            .from("categories")
            .select("name")
            .eq("id", productData.category_id)
            .single()
          setCategoryName(cat?.name)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.slug, searchParams.id, supabase, router])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const productImages = getAllProductImages(product.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:underline">Inicio</Link> {">"}{" "}
          {categoryName ? <span className="hover:underline">{categoryName}</span> : "Producto"}{" "}
          {">"} <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <ProductImageGallery images={productImages} productName={product.name} />
          <ProductInfo product={product} categoryName={categoryName} />
        </div>

        <div className="mt-6 sm:mt-8">
          <ProductSpecs product={product} />
        </div>
      </div>
    </div>
  )
}
