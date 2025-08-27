'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, title, description, variant, duration }
    
    setToasts((prev) => [...prev, newToast])

    // Auto dismiss after duration
    setTimeout(() => {
      dismiss(id)
    }, duration)

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'success' })
  }, [toast])

  const error = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'destructive' })
  }, [toast])

  const info = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'default' })
  }, [toast])

  return {
    toasts,
    toast,
    success,
    error,
    info,
    dismiss
  }
}
