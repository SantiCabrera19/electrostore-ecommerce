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
}

export default function ProductGrid({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  currentPage,
  totalPages,
  onPageChange,
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
          />
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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