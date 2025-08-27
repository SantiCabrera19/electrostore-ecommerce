'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LoadingSkeletonProps {
  variant?: 'product' | 'form' | 'list' | 'page'
  count?: number
}

export default function LoadingSkeleton({ variant = 'page', count = 1 }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  if (variant === 'product') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
        {skeletons.map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-5 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'form') {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
          <div className="h-10 bg-muted rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {skeletons.map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
            <div className="w-16 h-16 bg-muted rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-muted rounded w-20"></div>
          </div>
        ))}
      </div>
    )
  }

  // Default page skeleton
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
