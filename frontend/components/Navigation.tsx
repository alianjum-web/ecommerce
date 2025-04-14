// components/ErrorBoundary.tsx
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

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast.success('Logged out',{
        description: 'You have been successfully logged out',
      })
    } catch {
      toast.error('Error',{
        description: 'Failed to log out',
      })
    }
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center space-x-6">
        <Link 
          href="/shopping/home" 
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname === '/shopping/home' ? 'text-black' : 'text-muted-foreground'
          }`}
        >
          Home
        </Link>
        
        {isAuthenticated && (
          <Link
            href="/shopping/account"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith('/shopping/account') ? 'text-black' : 'text-muted-foreground'
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
                  pathname.startsWith('/admin') ? 'text-black' : 'text-muted-foreground'
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