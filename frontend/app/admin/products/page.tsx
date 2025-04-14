// app/admin/products/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/hooks/authUtlils';
import AdminProductsView from './admin-products-view';

export default async function AdminProductsPage() {
  const user = await getCurrentUser()
  
  // Redirect if user is not admin or seller
  if (!user || !['admin', 'seller'].includes(user.role)) {
    redirect('/unauth-page')
  }
  
  return <AdminProductsView />
}