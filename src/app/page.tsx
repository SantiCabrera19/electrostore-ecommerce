import { createServerClient } from "@/lib/supabase"
import EcommercePageClient from "@/components/catalog/EcommercePageClient"
import PromoCardsCarousel from "@/components/home/PromoCardsCarousel"
import type { Tables } from "@/types/supabase"

// Deshabilitar cache para que siempre muestre productos actualizados
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EcommercePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerClient()

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
  
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*")

  // Fetch promos (reusing banners table), ignoring image fields
  let banners: any[] = []
  try {
    const { data: bannersData, error: bannersError } = await supabase
      .from("banners")
      .select("id, title, subtitle, cta_label, cta_href, position")
      .order("position", { ascending: true })
    if (!bannersError && bannersData) banners = bannersData
  } catch (_) {
    // Ignore if the table isn't present yet
  }

  if (productsError) {
    console.error("Error fetching products:", productsError.message)
    return <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Error al cargar productos</h2>
        <p className="text-muted-foreground">{productsError.message}</p>
      </div>
    </div>
  }

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError.message)
    return <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Error al cargar categorías</h2>
        <p className="text-muted-foreground">{categoriesError.message}</p>
      </div>
    </div>
  }

  const selectedCategory = typeof searchParams.category === "string" ? searchParams.category : null
  const currentPage = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1
  const pageSize = 6

  const categoryId = selectedCategory
  
  const filteredProducts = categoryId
    ? products?.filter((p: Tables<"products">) => p.category_id === categoryId) || []
    : products || []

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const pageProducts = filteredProducts.slice(start, end)


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-none sm:max-w-7xl">
        {/* Promos hero */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <PromoCardsCarousel promos={banners as any[]} />
        </div>
        <EcommercePageClient
          initialProducts={pageProducts}
          categories={categories || []}
          initialCategory={selectedCategory}
          initialPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
