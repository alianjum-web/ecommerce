'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // This is just a fallback in case middleware doesn't catch it
    router.replace('/shopping/home')
  }, [router])

  return null
}