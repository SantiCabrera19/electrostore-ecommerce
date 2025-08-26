"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, LogOut, Settings } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
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
        <span className="text-sm text-white/90 font-medium">
          Hola, {displayName}
        </span>
        {isAdmin && (
          <Button variant="ghost" size="sm" className="bg-white text-teal-600 hover:bg-gray-50 hover:text-teal-700 font-medium shadow-md" asChild>
            <Link href="/admin">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="sm" className="bg-white text-teal-600 hover:bg-gray-50 hover:text-teal-700 font-medium shadow-md" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </>
    )
  }

  return (
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
  )
}
