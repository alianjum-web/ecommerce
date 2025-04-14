// app/shopping/checkout/page.tsx
import { redirect } from 'next/navigation'
import { checkAuth } from '@/lib/hooks/authUtlils'
import CheckoutView from './checkout-view'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Checkout',
  description: 'Complete your purchase securely',
}

export default async function ShoppingCheckoutPage() {
  try {
    const user = await checkAuth('/auth/login?redirect=/shopping/checkout')
    return <CheckoutView user={user} />
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('UNAUTHENTICATED:')) {
      redirect(error.message.split(':')[1] || '/unauth-page')
    }
    redirect('/unauth-page')
  }
}