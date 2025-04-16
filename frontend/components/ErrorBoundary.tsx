// components/ErrorBoundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { AuthError } from '@/lib/errors/auth-error'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.state.error instanceof AuthError) {
        return <AuthErrorHandler error={this.state.error} />
      }
      return <GenericErrorHandler />
    }

    return this.props.children
  }
}

function AuthErrorHandler({ error }: { error: AuthError }) {
  const router = useRouter()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/auth/login?redirect=${encodeURIComponent(error.redirectPath)}`)
    }, 2000)

    return () => clearTimeout(timer)
  }, [error.redirectPath, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">Authentication Required</h1>
      <p>Redirecting to login page...</p>
      <Button onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(error.redirectPath)}`)}>
        Go to Login Now
      </Button>
    </div>
  )
}

function GenericErrorHandler() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p>We&apos;re working on fixing this. You&apos;ll be redirected to the home page.</p>
      <Button onClick={() => router.push('/')}>
        Go to Home Now
      </Button>
    </div>
  )
}