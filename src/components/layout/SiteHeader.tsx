"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Search, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createBrowserClient } from "@/lib/supabase"
import AuthButtons from "./AuthButtons"
import CategoriesDropdown from "./CategoriesDropdown"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Tables } from "@/types/supabase"

type Category = Tables<"categories">

export default function SiteHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [cartItemCount, setCartItemCount] = useState(0)
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    supabase.from("categories").select("*").then(({ data }) => {
      if (data) setCategories(data)
    })

    import('@/lib/cart').then(({ getCartItemCount }) => {
      setCartItemCount(getCartItemCount())
    })

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

  return (
    <header className="bg-teal-600 border-b border-teal-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Top row: Logo and Cart */}
          <div className="flex items-center justify-between py-3">
            <Link href="/" aria-label="Ir al inicio" className="inline-block">
              <h1 className="text-xl font-bold text-white font-serif">ElectroStore</h1>
            </Link>
            
            <div className="flex items-center gap-2">
              <AuthButtons user={user} onLogout={handleLogout} />
              <Button size="sm" className="bg-white text-teal-600 hover:bg-gray-100 font-medium shadow-md relative p-2" asChild>
                <Link href="/store/cart">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="pb-3">
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
          
          {/* Categories and links */}
          <div className="flex items-center gap-4 pb-3 overflow-x-auto">
            <CategoriesDropdown categories={categories} />
            <Link href="/" className="text-white/90 hover:text-white transition-colors whitespace-nowrap text-sm">
              Ofertas
            </Link>
            <Link href="/" className="text-white/90 hover:text-white transition-colors whitespace-nowrap text-sm">
              Ayuda
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
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

            <div className="flex items-center space-x-4">
              <AuthButtons user={user} onLogout={handleLogout} />
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

          <div className="flex items-center space-x-8 pb-4">
            <CategoriesDropdown categories={categories} />
            <Link href="/" className="text-white/90 hover:text-white transition-colors">
              Ofertas
            </Link>
            <Link href="/" className="text-white/90 hover:text-white transition-colors">
              Ayuda
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}