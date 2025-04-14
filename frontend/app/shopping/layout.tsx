// app/shopping/layout.tsx
'use client'

import { ReactNode } from 'react'
import { useAppSelector } from '@/store/hooks'
import Navigation from '@/components/Navigation' // Remove the curly braces

export default function ShoppingLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  return (
    <div className="shopping-layout">
      <Navigation />
      <main>{children}</main>
    </div>
  )
}