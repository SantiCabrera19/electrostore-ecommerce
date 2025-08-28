'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, ShoppingCart, Lock } from 'lucide-react'
import { translateAuthMessage } from '@/lib/auth-translations'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
  showLoginPrompt?: boolean
}

export default function AuthGuard({ 
  children, 
  redirectTo = '/auth/login',
  requireAuth = true,
  showLoginPrompt = true 
}: AuthGuardProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (requireAuth && !user) {
        if (!showLoginPrompt) {
          router.push(redirectTo)
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{translateAuthMessage('Loading...')}</p>
        </div>
      </div>
    )
  }

  // Si requiere autenticación y no hay usuario
  if (requireAuth && !user) {
    if (showLoginPrompt) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Iniciar Sesión Requerido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                <p>Para continuar con tu compra necesitas iniciar sesión en tu cuenta.</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  {translateAuthMessage('Sign In')}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/register')}
                  className="w-full"
                >
                  {translateAuthMessage('Create Account')}
                </Button>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="ghost"
                  onClick={() => router.push('/')}
                  className="text-sm"
                >
                  Volver al inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    return null
  }

  // Si tiene usuario o no requiere autenticación, mostrar contenido
  return <>{children}</>
}
