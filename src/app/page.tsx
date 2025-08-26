import { createServerClient } from "@/lib/supabase"
import EcommercePageClient from "@/components/catalog/EcommercePageClient"
import type { Tables } from "@/types/supabase"

export default async function EcommercePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerClient()

  const { data: products, error: productsError } = await supabase.from("products").select("*")
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*")

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
    <div className="container mx-auto px-4 py-8">
      <EcommercePageClient
        products={pageProducts}
        categories={categories || []}
        selectedCategory={selectedCategory}
        currentPage={currentPage}
        totalPages={totalPages}
        totalProducts={filteredProducts.length}
      />
    </div>
  )
}
