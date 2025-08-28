"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, LogOut, Settings } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
import { translateAuthMessage } from "@/lib/auth-translations"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface AuthButtonsProps {
  user: SupabaseUser | null
  onLogout: () => void
}

interface UserProfile {
  full_name: string | null
  role: string
}

export default function AuthButtons({ user, onLogout }: AuthButtonsProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (user && !userProfile) {
      fetchUserProfile()
    } else if (!user) {
      setUserProfile(null)
    }
  }, [user, userProfile])

  const fetchUserProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('users')
      .select('full_name, role')
      .eq('id', user.id)
      .single()

    if (data) {
      setUserProfile(data)
    }
  }

  if (user) {
    const displayName = userProfile?.full_name || user.email?.split('@')[0] || 'Usuario'
    const isAdmin = userProfile?.role === 'admin'

    return (
      <>
        {/* Desktop: Show full text */}
        <span className="hidden sm:block text-sm text-white/90 font-medium">
          Hola, {displayName}
        </span>
        {isAdmin && (
          <Button variant="ghost" size="sm" className="bg-white text-teal-600 hover:bg-gray-50 hover:text-teal-700 font-medium shadow-md hidden sm:inline-flex" asChild>
            <Link href="/admin">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
        )}
        {/* Mobile: Icon only for admin */}
        {isAdmin && (
          <Button variant="ghost" size="sm" className="bg-white text-teal-600 hover:bg-gray-50 hover:text-teal-700 font-medium shadow-md sm:hidden p-2" asChild>
            <Link href="/admin">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {/* Desktop: Full logout button */}
        <Button variant="ghost" size="sm" className="bg-white text-teal-600 hover:bg-gray-50 hover:text-teal-700 font-medium shadow-md hidden sm:inline-flex" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          {translateAuthMessage('Sign Out')}
        </Button>
        {/* Mobile: Icon only logout */}
        <Button variant="ghost" size="sm" className="bg-white text-teal-600 hover:bg-gray-50 hover:text-teal-700 font-medium shadow-md sm:hidden p-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </>
    )
  }

  return (
    <>
      {/* Desktop: Full buttons */}
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30 hidden sm:inline-flex" asChild>
        <Link href="/auth/register">{translateAuthMessage('Create Account')}</Link>
      </Button>
      <Button size="sm" className="bg-white text-teal-600 hover:bg-gray-100 font-medium shadow-md hidden sm:inline-flex" asChild>
        <Link href="/auth/login">
          <User className="h-4 w-4 mr-2" />
          {translateAuthMessage('Sign In')}
        </Link>
      </Button>
      {/* Mobile: Compact buttons */}
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30 sm:hidden text-xs px-2" asChild>
        <Link href="/auth/register">Registro</Link>
      </Button>
      <Button size="sm" className="bg-white text-teal-600 hover:bg-gray-100 font-medium shadow-md sm:hidden p-2" asChild>
        <Link href="/auth/login">
          <User className="h-4 w-4" />
        </Link>
      </Button>
    </>
  )
}
