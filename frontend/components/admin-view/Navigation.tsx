// components/admin/Navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/store/hooks'
import { logoutUser } from '@/store/auth-slice'
import { toast } from 'sonner'
import { useState } from 'react'

export default function AdminNavigation() {
  const pathname = usePathname()
  const dispatch = useAppDispatch()

 
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await dispatch(logoutUser()).unwrap()
    } catch  {
      toast.error('Logout failed')
    } finally {
      setIsLoggingOut(false)
    }
  }


  return (
    <nav className="flex items-center gap-4 p-4 bg-gray-100">
      <Link href="/admin/dashboard" className={pathname === '/admin/dashboard' ? 'font-bold' : ''}>
        Dashboard
      </Link>
      <Link href="/admin/products" className={pathname === '/admin/products' ? 'font-bold' : ''}>
        Products
      </Link>
      <Link href="/admin/orders" className={pathname === '/admin/orders' ? 'font-bold' : ''}>
        Orders
      </Link>
      <div className="ml-auto">
        <Link href="/shopping/home" className="mr-4">
          View Store
        </Link>
        <Button onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </Button>      </div>
    </nav>
  )
}