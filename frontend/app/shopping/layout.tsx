"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import Navigation from "@/components/Navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RequireRole from "@/components/auth/RequireRole";

// Define public routes that don't  require authentication
const PUBLIC_ROUTES = [
  "/shopping/home",
  "/shopping/listing",
  "/shopping/search",
];

// Define buyer only routes
const BUYER_ONLY_ROUTES = ["/shopping/checkout", "shopping/payment"];

export default function ShoppingLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  //  Normalize the path by removing any /app prefix
  const cleanPath = useMemo(
    () => pathname?.replace(/^\/app/, "") || "",
    [pathname]
  );

  // check if the current route is public
  const isPublicRoute = useMemo(
    () => PUBLIC_ROUTES.some((route) => cleanPath.startsWith(route)),
    [cleanPath]
  );

  // check if the router requires buyer role
  const requireBuyerRole = useMemo(
    () => BUYER_ONLY_ROUTES.some((route) => cleanPath.startsWith(route)),
    [cleanPath]
  );

  useEffect(() => {
    //Skip auth check for the public routes
    if (isPublicRoute) return;

    if (isLoading) return;
  
    // Redirect loginc for the protected routes
    if (!isAuthenticated) {
      router.push(`/unauth-page?returnUrl=${encodeURIComponent}`)
    }

        // Redirect loginc for the buyer only routes
    if (requireBuyerRole && user?.role !== 'buyer') {
      router.push(`/unauth-page`)
    }

  }, [isAuthenticated, isLoading, isPublicRoute, requireBuyerRole, cleanPath, router, user]);

  // Show loading spinner while auth state is being checked (only for protected routes)
  if (!isPublicRoute && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  // Don't render anything if redirecting (handled in useEffect)
  if (!isPublicRoute &&!isAuthenticated) {
    return null;
  }
  // Main layout render
  return (
    <div className="shopping-laypout">
      <Navigation />
      <main className='container mx-auto px-4 py-8'>
        {children}
      </main>
    </div>
  )

}
