// app/shopping/checkout/checkout-view.tsx
'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner'
import Address from '@/components/shopping-view/address'
import UserCartItemsContent from '@/components/shopping-view/cart-items-content'
import { createNewOrder } from '@/store/shop/order-slice'
import { RootState } from '@/store/store'
import { CartItem } from '@/utils/types'
import { Address as UserAddress } from '@/store/shop/address-slice'
import img from '@/assets/account.jpg'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order as OrderData } from '@/store/admin/order-slice'
import { useRouteProtection } from '@/lib/hooks/useRouteProtection'
import type { User } from '@/utils/types'

interface CheckoutViewProps {
  user: User
}

export default function CheckoutView({ user }: CheckoutViewProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading: isAuthLoading } = useRouteProtection()

  // Selectors with proper typing
  const { cartItems } = useAppSelector((state: RootState) => state.shopCart)
  const { approvalURL, isLoading: isOrderLoading } = useAppSelector((state: RootState) => state.shopOrder)

  const [currentSelectedAddress, setCurrentSelectedAddress] = useState<UserAddress | null>(null)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)

  // Calculate total amount
  const totalCartAmount = cartItems?.reduce(
    (sum, currentItem) => sum + (currentItem.salePrice > 0 ? currentItem.salePrice : currentItem.price) * currentItem.quantity,
    0
  ) || 0

  // Handle PayPal payment initiation
  const handleInitiatePaypalPayment = useCallback(async () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/shopping/checkout')
      return
    }

    if (!cartItems?.length) {
      toast.error("Your cart is empty")
      return
    }
  
    if (!currentSelectedAddress) {
      toast.error("Shipping address required")
      return
    }

    const orderData: OrderData = {
      userId: user._id,
      cartItems: cartItems.map((item: CartItem) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress._id,
        address: currentSelectedAddress.address,
        city: currentSelectedAddress.city,
        pincode: currentSelectedAddress.pincode,
        phone: currentSelectedAddress.phone,
        notes: currentSelectedAddress.notes || '',
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date().toLocaleDateString(),
      _id: "",
      payerId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  
    try {
      setIsPaymentProcessing(true)
      const result = await dispatch(createNewOrder(orderData)).unwrap()
      
      if (result.approvalURL) {
        toast.success("Redirecting to PayPal...")
      }
    } catch  {
      toast.error("Payment processing failed")
      setIsPaymentProcessing(false)
    }
  }, [cartItems, currentSelectedAddress, user, dispatch, totalCartAmount, isAuthenticated, router])

  // Handle PayPal redirection
  useEffect(() => {
    if (approvalURL) {
      window.location.href = approvalURL
    }
  }, [approvalURL])

  // Client-side auth protection
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/shopping/checkout')
    }
  }, [isAuthenticated, isAuthLoading, router])

  if (!isAuthenticated || isAuthLoading) {
    return (
      <div className="flex flex-col">
        <div className="relative h-[300px] w-full overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-8">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <Image
          src={img}
          alt="Checkout page banner"
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
        />
      </div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Shipping Address</h2>
          <Address
            selectedId={currentSelectedAddress ? { _id: currentSelectedAddress._id } : undefined}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Order Summary</h2>
          
          {cartItems?.length ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Your cart is empty</p>
          )}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal</span>
              <span>${totalCartAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total</span>
              <span>${totalCartAmount.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleInitiatePaypalPayment}
            className="w-full mt-6"
            disabled={isPaymentProcessing || isOrderLoading || !cartItems?.length}
          >
            {isPaymentProcessing || isOrderLoading ? (
              <Skeleton className="mr-2 h-4 w-4" />
            ) : null}
            {isPaymentProcessing || isOrderLoading ? "Processing..." : "Checkout with PayPal"}
          </Button>
        </div>
      </div>
    </div>
  )
}