'use client'

import { Toast, type ToastProps } from './toast'
import { useToast } from '@/hooks/useToast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast: ToastProps) => (
        <Toast key={toast.id} {...toast} onClose={dismiss} />
      ))}
    </div>
  )
}
