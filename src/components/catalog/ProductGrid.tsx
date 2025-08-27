"use client"

import ProductCard from "./ProductCard"
import CategorySidebar from "./CategorySidebar"
import Pagination from "./Pagination"
import type { Tables } from '@/types/supabase'

type Product = Tables<'products'>
type Category = Tables<'categories'>

type Props = {
  products: Product[]
  categories: Category[]
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onPriceFilter: (min: number, max: number) => void
  onOffersToggle: (showOnlyOffers: boolean) => void
  showOnlyOffers: boolean
}

export default function ProductGrid({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  currentPage,
  totalPages,
  onPageChange,
  onPriceFilter,
  onOffersToggle,
  showOnlyOffers,
}: Props) {

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
      {/* Mobile: Categories as horizontal scroll, Desktop: Sidebar */}
      <aside className="w-full lg:w-64 lg:flex-shrink-0">
        <div className="lg:sticky lg:top-4">
          <CategorySidebar
            categories={categories}
            products={products}
            selectedCategory={selectedCategory}
            filteredProducts={products}
            onPriceFilter={onPriceFilter}
            onOffersToggle={onOffersToggle}
            showOnlyOffers={showOnlyOffers}
          />
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No se encontraron productos
            </div>
          )}
        </div>

        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </main>
    </div>
  )
}