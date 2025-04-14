// hooks/useRouteProtection.ts
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { checkAuth } from '@/store/auth-slice'
import { AuthError } from '@/lib/errors/auth-error'

export const useRouteProtection = (requiredRoles?: string[]) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isInitialized, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await dispatch(checkAuth()).unwrap()
      } catch (error) {
        if (error instanceof AuthError) {
          const redirectUrl = `${pathname}?${searchParams.toString()}`
          router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`)
        }
      }
    }
    verifyAuth()
  }, [dispatch, pathname, searchParams, router])

  useEffect(() => {
    if (!isInitialized || isLoading) return

    if (!isAuthenticated && requiredRoles) {
      const redirectUrl = `${pathname}?${searchParams.toString()}`
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }

    if (isAuthenticated && requiredRoles && user?.role && !requiredRoles.includes(user.role)) {
      router.push('/unauth-page')
      return
    }
  }, [isAuthenticated, isInitialized, isLoading, requiredRoles, router, user?.role, pathname, searchParams])

  return {
    isAuthenticated,
    user,
    isLoading: isLoading || !isInitialized,
    hasRequiredRole: requiredRoles ? requiredRoles.includes(user?.role || '') : true
  }
}