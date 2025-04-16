// app/shopping/account/page.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/hooks/authUtlils'
import ShoppingAccountView from './shopping-account-view'
import ProtectedRoute from '@/components/shopping-view/ProtectedRoutes'
// import publicRoute from 


export default async function ShoppingAccountPage() {
  const user = await getCurrentUser()
  
  // Redirect if user is not authenticated
  if (!user) {
    redirect('/auth/login?redirect=/shopping/account')
  }
  
  return (
    <ProtectedRoute publicRoute>

  <ShoppingAccountView />
  </ProtectedRoute>
  );
}