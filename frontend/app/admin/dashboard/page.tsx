import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/hooks/authUtlils'
import AdminDashboardView from './admin-dashboard-view'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  
  // Redirect if user is not admin or seller
  if (!user || !['admin', 'seller'].includes(user.role)) {
    redirect('/unauth-page')
  }
  
  return <AdminDashboardView  />
}