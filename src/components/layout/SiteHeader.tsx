"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Search, ShoppingCart, User, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createBrowserClient } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Tables } from "@/types/supabase"

type Category = Tables<"categories">

export default function SiteHeader() {
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [cartItemCount, setCartItemCount] = useState(0)
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Fetch categories
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) setCategories(data)
    })

    // Initialize cart count
    import('@/lib/cart').then(({ getCartItemCount }) => {
      setCartItemCount(getCartItemCount())
    })

    // Listen for cart updates
    const handleCartUpdate = () => {
      import('@/lib/cart').then(({ getCartItemCount }) => {
        setCartItemCount(getCartItemCount())
      })
    }

    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleMouseEnterDropdown = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      setDropdownTimeout(null)
    }
    setShowCategoriesDropdown(true)
  }

  const handleMouseLeaveDropdown = () => {
    const timeout = setTimeout(() => {
      setShowCategoriesDropdown(false)
    }, 150) // 150ms delay
    setDropdownTimeout(timeout)
  }

  return (
    <header className="bg-teal-600 border-b border-teal-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section with logo, search, and user actions */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Ir al inicio" className="inline-block">
              <h1 className="text-2xl font-bold text-white font-serif">ElectroStore</h1>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                aria-label="Buscar productos"
              />
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-white/80">
                  Hola, {user.email}
                </span>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30" asChild>
                  <Link href="/auth/register">Crea tu cuenta</Link>
                </Button>
                <Button size="sm" className="bg-white text-teal-600 hover:bg-gray-100 font-medium shadow-md" asChild>
                  <Link href="/auth/login">
                    <User className="h-4 w-4 mr-2" />
                    Ingresa
                  </Link>
                </Button>
              </>
            )}
            <Button size="sm" className="bg-white text-teal-600 hover:bg-gray-100 font-medium shadow-md relative" asChild>
              <Link href="/store/cart">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Carrito
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center space-x-8 pb-4">
          <div 
            className="relative"
            onMouseEnter={handleMouseEnterDropdown}
            onMouseLeave={handleMouseLeaveDropdown}
          >
            <button
              className="flex items-center space-x-1 text-white/90 hover:text-white transition-colors"
              aria-haspopup="menu"
              aria-expanded={showCategoriesDropdown}
            >
              <span>Categorías</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Categories dropdown */}
            {showCategoriesDropdown && (
              <div
                className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                role="menu"
                onMouseEnter={handleMouseEnterDropdown}
                onMouseLeave={handleMouseLeaveDropdown}
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

          <Link href="/" className="text-white/90 hover:text-white transition-colors">
            Ofertas
          </Link>
          <Link href="/" className="text-white/90 hover:text-white transition-colors">
            Ayuda
          </Link>
        </div>
      </div>
    </header>
  )
}