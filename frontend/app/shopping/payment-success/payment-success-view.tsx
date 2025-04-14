
// app/shopping/payment-success/payment-success-view.tsx
"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { toast } from '@/components/ui/sonner'
import { CheckCircle2 } from 'lucide-react'
import { useRouteProtection } from '@/lib/hooks/useRouteProtection'

export default function PaymentSuccessView() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { isAuthenticated } = useRouteProtection()

  // Show success toast on first render
  useEffect(() => {
    if (isAuthenticated) {
      toast('Payment Successful', {
        description: 'Your order has been placed successfully',
      })
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <CardHeader className="space-y-4 p-0">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <CheckCircle2 className="h-6 w-6 text-gray-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifying Payment</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please wait while we verify your payment details...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <CardHeader className="space-y-4 p-0">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Thank you for your purchase. {orderId && `Your order ID is: ${orderId}`}
          </CardDescription>
        </CardHeader>

        <CardFooter className="mt-6 flex flex-col gap-3 p-0">
          <Button asChild className="w-full">
            <Link href="/shopping/account/orders">View Order Details</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/shopping">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}