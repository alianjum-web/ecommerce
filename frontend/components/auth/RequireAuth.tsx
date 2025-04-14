// components/auth/RequireAuth.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { checkAuth } from '@/store/auth-slice'
import { useAppDispatch } from '@/store/hooks'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Check auth status first
      dispatch(checkAuth())
        .unwrap()
        .catch(() => {
          const redirectPath = window.location.pathname.replace('/app', '')
          router.push(`/app/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
        })
    }
  }, [isAuthenticated, isLoading, router, dispatch])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null // or a loading spinner
  }

  return <>{children}</>
}