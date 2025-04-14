// app/shopping/checkout/layout.tsx
'use client'

import RequireAuth from '@/components/auth/RequireAuth'
import RequireRole from '@/components/auth/RequireRole'

export default function ProtectedBuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={['buyer', 'admin', 'seller']}>
        {children}
      </RequireRole>
    </RequireAuth>
  )
}
