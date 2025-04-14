// components/ErrorBoundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { AuthError } from '@/lib/errors/auth-error'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
    router.push(`/auth/login?redirect=${encodeURIComponent(error.redirectPath)}`)
  }, [error.redirectPath, router])

  return <div>Redirecting to login...</div>
}

function GenericErrorHandler() {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="mt-2">Please try again later or contact support</p>
    </div>
  )
}