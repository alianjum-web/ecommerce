// app/root-redirect.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/shopping/home')
  }, [router])

  return null;
}