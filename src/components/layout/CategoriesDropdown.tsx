"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import type { Tables } from "@/types/supabase"

type Category = Tables<"categories">

interface CategoriesDropdownProps {
  categories: Category[]
}

export default function CategoriesDropdown({ categories }: CategoriesDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileSidebar) {
        const sidebar = document.getElementById('mobile-categories-sidebar')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setShowMobileSidebar(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMobileSidebar])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (showMobileSidebar) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMobileSidebar])

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

  const closeSidebar = () => {
    setShowMobileSidebar(false)
  }

  return (
    <>
      {/* Desktop Dropdown */}
      <div 
        className="relative hidden lg:block"
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

      {/* Mobile Button */}
      <button
        className="flex items-center space-x-1 text-white/90 hover:text-white transition-colors lg:hidden"
        onClick={() => setShowMobileSidebar(true)}
        aria-label="Abrir categorías"
      >
        <Menu className="h-4 w-4" />
        <span className="text-sm">Categorías</span>
      </button>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <div 
            id="mobile-categories-sidebar"
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-teal-600">
              <h2 className="text-lg font-semibold text-white">Categorías</h2>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-lg hover:bg-teal-700 transition-colors"
                aria-label="Cerrar categorías"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Categories List */}
            <div className="p-4 space-y-2">
              <Link
                href="/"
                onClick={closeSidebar}
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
              >
                Todos los productos
              </Link>
              
              {categories.filter(category => category.name !== 'Limpieza').map((category) => (
                <Link
                  key={category.id}
                  href={`/?category=${category.id}`}
                  onClick={closeSidebar}
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                >
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
