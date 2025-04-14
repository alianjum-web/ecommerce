// components/auth/RequireRole.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'

export default function RequireRole({
  children,
  allowedRoles
}: {
  children: React.ReactNode
  allowedRoles: ('admin' | 'seller' | 'buyer')[]
}) {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
      } else if (user && !allowedRoles.includes(user.role)) {
        router.push('/unauth-page')
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router])

  if (isLoading || !isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}