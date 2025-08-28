'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createBrowserClient()
        
        // Get the code from URL parameters
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(errorDescription || 'Error en la confirmación de email')
          return
        }

        if (code) {
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            setStatus('error')
            setMessage('Error al confirmar tu cuenta: ' + exchangeError.message)
            return
          }

          if (data.user) {
            setStatus('success')
            setMessage('¡Cuenta confirmada exitosamente!')
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
              router.push('/')
            }, 2000)
          }
        } else {
          setStatus('error')
          setMessage('Código de confirmación no válido')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('error')
        setMessage('Error inesperado durante la confirmación')
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">ElectroStore</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h2 className="text-xl font-semibold">Confirmando tu cuenta...</h2>
              <p className="text-muted-foreground">
                Por favor espera mientras procesamos tu confirmación
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <h2 className="text-xl font-semibold text-green-700">¡Confirmación exitosa!</h2>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground">
                Serás redirigido al inicio en unos segundos...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <h2 className="text-xl font-semibold text-red-700">Error de confirmación</h2>
              <p className="text-muted-foreground">{message}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  Ir a Iniciar Sesión
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Volver al Inicio
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">ElectroStore</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Cargando...</h2>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
