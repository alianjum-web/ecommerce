// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/store/hooks'
import { logoutUser } from '@/store/auth-slice'
import { toast } from '@/components/ui/sonner'

export default function Navigation() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  // Helper function to determine if a path is active
  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast.success('Logged out successfully')
      window.location.href = '/auth/login' // Full reload to clear state
    } catch {
      toast.error('Failed to log out')
    }
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center space-x-6">
        <Link 
          href="/shopping/home" 
          className={`text-sm font-medium transition-colors hover:text-primary ${
            isActive('/shopping/home') ? 'text-black' : 'text-muted-foreground'
          }`}
        >
          Home
        </Link>
        
        {isAuthenticated && (
          <Link
            href="/shopping/account"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/shopping/account') ? 'text-black' : 'text-muted-foreground'
            }`}
          >
            My Account
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {user && ['admin', 'seller'].includes(user.role) && (
              <Link
                href="/admin/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/admin/dashboard') ? 'text-black' : 'text-muted-foreground'
                }`}
              >
                Admin Dashboard
              </Link>
            )}
            <Button 
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <Link href="/auth/login">
            <Button variant="default" size="sm">
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}