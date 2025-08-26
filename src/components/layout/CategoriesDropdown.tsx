"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import type { Tables } from "@/types/supabase"

type Category = Tables<"categories">

interface CategoriesDropdownProps {
  categories: Category[]
}

export default function CategoriesDropdown({ categories }: CategoriesDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      setDropdownTimeout(null)
    }
    setShowDropdown(true)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false)
    }, 150)
    setDropdownTimeout(timeout)
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center space-x-1 text-white/90 hover:text-white transition-colors"
        aria-haspopup="menu"
        aria-expanded={showDropdown}
      >
        <span>Categorías</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {showDropdown && (
        <div
          className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          role="menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="py-2">
            {categories.filter(category => category.name !== 'Limpieza').map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.id}`}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex justify-between items-center block text-gray-700"
              >
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
