
'use client'

import { AddressInfo } from "@/utils/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useRouteProtection } from '@/lib/hooks/useRouteProtection'

// Dynamically import components
const Address = dynamic(() => import('@/components/shopping-view/address'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />
})

const ShoppingOrders = dynamic(() => import('@/components/shopping-view/orders'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />
})

export default function ShoppingAccountView() {
  const { isAuthenticated, isLoading } = useRouteProtection()

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return null // Redirect handled by hook
  }

  const handleAddressSelect = (address: AddressInfo) => {
    console.log('Selected address:', address)
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <Image
          src="/account.jpg"
          alt="Account overview"
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
        />
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-8 py-8">
        <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <ShoppingOrders />
              </Suspense>
            </TabsContent>

            <TabsContent value="address">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <Address 
                  setCurrentSelectedAddress={handleAddressSelect} 
                  selectedId={undefined}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}