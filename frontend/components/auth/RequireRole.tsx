// components/auth/RequireRole.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function RequireRole({
  children,
  allowedRoles
}: {
  children: React.ReactNode
  allowedRoles: ('admin' | 'seller' | 'buyer')[]
}) {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/app/auth/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (user && !allowedRoles.includes(user.role)) {
        router.push('/app/unauth-page')
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname])

  if (isLoading || !isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return <>{children}</>
}