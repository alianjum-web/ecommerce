// app/admin/layout.tsx
'use client'

import { ReactNode } from 'react'
import { useRouteProtection } from '@/lib/hooks/useRouteProtection'
import AdminNavigation from '@/components/admin-view/Navigation'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function AdminLayout({ children }: { children: ReactNode }) {
  useRouteProtection(['admin', 'seller'])

  return (
    <ErrorBoundary>
      <div className="admin-layout">
        <AdminNavigation />
        <main className="p-4">{children}</main>
      </div>
    </ErrorBoundary>
  )
}