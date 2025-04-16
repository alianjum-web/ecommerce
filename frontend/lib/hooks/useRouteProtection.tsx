// hooks/useRouteProtection.ts
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { checkAuth } from '@/store/auth-slice'
import { AuthError } from '@/lib/errors/auth-error'

export const useRouteProtection = (requiredRoles?: string[]) => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isInitialized, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await dispatch(checkAuth()).unwrap()
        
        // After successful auth check, verify roles if needed
        if (requiredRoles && user?.role && !requiredRoles.includes(user.role)) {
          router.push('/unauth-page')
        }
      } catch (error) {
        if (error instanceof AuthError) {
          const redirectUrl = pathname.replace('/app', '') // Remove /app prefix
          router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`)
        }
      }
    }
    
    if (!isInitialized) {
      verifyAuth()
    }
  }, [dispatch, isInitialized, pathname, requiredRoles, router, user?.role])

  return {
    isAuthenticated,
    user,
    isLoading: isLoading || !isInitialized,
    hasRequiredRole: requiredRoles ? requiredRoles.includes(user?.role || '') : true
  }
}