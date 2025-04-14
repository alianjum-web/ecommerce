// app/shopping/paypal-return/paypal-return-view.tsx
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouteProtection } from "@/lib/hooks/useRouteProtection";

export default function PaypalReturnView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add route protection
  const { isAuthenticated, isLoading: isAuthLoading } = useRouteProtection();

  useEffect(() => {
    // Don't process payment if not authenticated
    if (!isAuthenticated && !isAuthLoading) {
      router.push("/auth/login?redirect=/shopping/paypal-return");
      return;
    }

    const processPayment = async () => {
      try {
        const paymentId = searchParams.get("paymentId");
        const payerId = searchParams.get("PayerID");

        if (typeof paymentId !== "string" || typeof payerId !== "string") {
          throw new Error("Invalid payment parameters");
        }

        const orderId = sessionStorage.getItem("currentOrderId");
        if (!orderId) {
          throw new Error("Order information not found");
        }

        const result = await dispatch(
          capturePayment({ paymentId, payerId, orderId: JSON.parse(orderId) })
        ).unwrap();
        

        if (result.success) {
          sessionStorage.removeItem("currentOrderId")
          router.push(`/shopping/payment-success?orderId=${orderId}`)
        } else {
          throw new Error("Payment processing failed");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        toast.error("Payment Error", {
          description: "There was an issue processing your payment",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    // Only process if authenticated
    if (isAuthenticated) {
      processPayment();
    }
  }, [router, dispatch, searchParams, isAuthenticated, isAuthLoading]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-md py-8">
        <Card>
          <CardHeader className="items-center text-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <CardTitle>Verifying Authentication</CardTitle>
            <CardDescription>
              Please wait while we verify your session
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end">
            <Button onClick={() => router.push("/shopping/checkout")}>
              Return to Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <Card>
        <CardHeader className="items-center text-center">
          {isProcessing ? (
            <>
              <Skeleton className="h-8 w-8 rounded-full" />
              <CardTitle>Processing Payment</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment
              </CardDescription>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <CardTitle>Payment Complete</CardTitle>
              <CardDescription>
                Redirecting to confirmation page...
              </CardDescription>
            </>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
