'use client'

import { ReactNode } from 'react'
import Navigation from '@/components/Navigation'
import { useAppSelector } from '@/store/hooks'
import { useRouter, usePathname } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useEffect } from 'react'

const publicRoutes = [
  '/shopping/home',
  '/shopping/listing',
  '/shopping/search'
]

export default function ShoppingLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const pathname = usePathname()
  
  // Get clean path without basePath
  const cleanPath = pathname?.replace('/app', '') || ''

  // Check if current route is protected
  const isProtectedRoute = !publicRoutes.some(route => cleanPath.startsWith(route))

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated && isProtectedRoute) {
      router.push(`/app/unauth-page?returnUrl=${encodeURIComponent(cleanPath)}`)
      return
    }

    // If trying to access cart-related pages without being a buyer
    if (isAuthenticated && user?.role !== 'buyer' && 
        (cleanPath.startsWith('/shopping/checkout') || 
         cleanPath.startsWith('/shopping/payment'))) {
      router.push('/app/unauth-page')
    }
  }, [isAuthenticated, isLoading, isProtectedRoute, cleanPath, router, user])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  }

  if (!isAuthenticated && isProtectedRoute) {
    return null // Redirect will happen in useEffect
  }

  return (
    <div className="shopping-layout">
      <Navigation />
      <main>{children}</main>
    </div>
  )
}