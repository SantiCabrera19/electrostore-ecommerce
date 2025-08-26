"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, LogOut } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface AuthButtonsProps {
  user: SupabaseUser | null
  onLogout: () => void
}

export default function AuthButtons({ user, onLogout }: AuthButtonsProps) {
  if (user) {
    return (
      <>
        <span className="text-sm text-white/80">
          Hola, {user.email}
        </span>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
          <Link href="/admin">Admin</Link>
        </Button>
        <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" onClick={onLogout}>
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
