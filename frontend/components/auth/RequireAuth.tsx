// components/auth/RequireAuth.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}