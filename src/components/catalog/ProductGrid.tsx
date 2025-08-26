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
    <div className="flex gap-8">
      <aside className="w-64 flex-shrink-0">
        <CategorySidebar
          categories={categories}
          products={products}
          selectedCategory={selectedCategory}
          filteredProducts={products}
        />
      </aside>

      <main className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </main>
    </div>
  )
}