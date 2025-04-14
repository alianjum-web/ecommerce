// app/shopping/payment-success/page.tsx
import { redirect } from 'next/navigation'
import { checkAuth } from '@/lib/hooks/authUtlils'
import PaymentSuccessView from './payment-success-view'
import { AuthError } from '@/lib/errors/auth-error' // Import your custom error type
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Successful',
  description: 'Your payment was processed successfully',
};

export default async function PaymentSuccessPage() {
  try {
    // Check authentication - will automatically redirect if not authenticated
    const user = await checkAuth('/auth/login?redirect=/shopping/payment-success');
    
    if (!user) {
      return redirect('/unauth-page');
    }
    
    return <PaymentSuccessView />
    
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      redirect(error.redirectPath);
    }
    
    // Fallback for unexpected errors
    console.error('Payment success page error:', error);
    redirect('/unauth-page');
  }
}


// catch (error: any) {
//   if (error.message.startsWith('UNAUTHENTICATED:')) {
//     redirect(error.message.split(':')[1])
//   }

// ./app/shopping/payment-success/page.tsx
// 15:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
