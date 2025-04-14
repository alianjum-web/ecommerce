// app/unauth-page/page.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function UnauthPage() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to view this page. Please sign in with an authorized account.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href={returnUrl ? `/auth/login?redirect=${returnUrl}` : '/auth/login'}>
            Sign In
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}