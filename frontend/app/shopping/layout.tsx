// app/shopping/layout.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import Navigation from '@/components/Navigation'
import { syncCartWithServer } from '@/store/shop/cart-slice'
import { syncAddresses } from '@/store/shop/address-slice'

export default function ShoppingLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(syncCartWithServer())
      dispatch(syncAddresses())
    }
  }, [isAuthenticated, user, dispatch])

  return (
    <div className="shopping-layout">
      <Navigation />
      <main>{children}</main>
    </div>
  )
}