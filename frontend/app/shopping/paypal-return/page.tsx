// app/shopping/paypal-return/page.tsx
import { redirect } from 'next/navigation'
import { checkAuth } from '@/lib/hooks/authUtlils'
import PaypalReturnView from './paypal-return-view'
import { AuthError } from '@/lib/errors/auth-error'

export default async function PaypalReturnPage() {
  try {
    // checkAuth will throw AuthError if not authenticated
    const user = await checkAuth('/auth/login?redirect=/shopping/paypal-return');
    if (user) {
      return <PaypalReturnView />
    } else {
      return redirect('/unauth-page')
    }
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return redirect(error.redirectPath)
    }
    
    // Fallback for unexpected errors
    console.error('PayPal return error:', error)
    return redirect('/unauth-page')
  }
}