// ProtectedRoute.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ('admin' | 'seller' | 'buyer')[]
  publicRoute?: boolean
}

export default function ProtectedRoute({ 
  children,
  allowedRoles,
  publicRoute = true
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isLoading) return;
    
    if (!publicRoute && !isAuthenticated) {
      router.push('/app/auth/login');
      return;
    }

    if (isAuthenticated && allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
      router.push('/app/unauth-page');
    }
  }, [isAuthenticated, isLoading, allowedRoles, user, router, publicRoute]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!publicRoute && !isAuthenticated) {
    return null;
  }

  if (isAuthenticated && allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}