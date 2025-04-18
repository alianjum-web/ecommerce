'use client'

import { ReactNode, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import Navigation from '@/components/Navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/shopping/home',
  '/shopping/listing',
  '/shopping/search'
]

// Define buyer-only routes
const BUYER_ONLY_ROUTES = [
  '/shopping/checkout',
  '/shopping/payment'
]

export default function ShoppingLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  // Normalize path by removing any /app prefix
  const cleanPath = useMemo(() => 
    pathname?.replace(/^\/app/, '') || '', 
    [pathname]
  )

  // Check if current route is public
  const isPublicRoute = useMemo(() => 
    PUBLIC_ROUTES.some(route => cleanPath.startsWith(route)),
    [cleanPath]
  )

  // Check if route requires buyer role
  const requiresBuyerRole = useMemo(() =>
    BUYER_ONLY_ROUTES.some(route => cleanPath.startsWith(route)),
    [cleanPath]
  )

  useEffect(() => {
    // Skip auth checks for public routes
    if (isPublicRoute) return

    if (isLoading) return

    // Redirect logic for protected routes
    if (!isAuthenticated) {
      router.push(`/unauth-page?returnUrl=${encodeURIComponent(cleanPath)}`)
      return
    }

    // Redirect logic for buyer-only routes
    if (requiresBuyerRole && user?.role !== 'buyer') {
      router.push('/unauth-page')
    }
  }, [isAuthenticated, isLoading, isPublicRoute, requiresBuyerRole, cleanPath, router, user])

  // Show loading spinner while auth state is being checked (only for protected routes)
  if (!isPublicRoute && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  // Don't render anything if redirecting (handled in useEffect)
  if (!isPublicRoute && !isAuthenticated) {
    return null
  }

  // Main layout render
  return (
    <div className="shopping-layout">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}