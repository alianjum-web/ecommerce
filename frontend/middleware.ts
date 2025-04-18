import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const publicRoutes = [
  "/shopping/home",
  "/shopping/listing",
  "/shopping/search",
  "/not-found",
  "/unauth-page",
  "/auth/register",
  "/auth/login"
];

const protectedRoutes = [
  { path: "/shopping/account", roles: ["buyer", "seller", "admin"] },
  { path: "/shopping/checkout", roles: ["buyer", "seller", "admin"] },
  { path: "/shopping/payment-success", roles: ["buyer", "seller", "admin"] },
  { path: "/shopping/payment-return", roles: ["buyer", "seller", "admin"] },
  { path: "/admin", roles: ["seller", "admin"] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Skip API routes, static files, and public endpoints
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    publicRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Normalize path by removing any duplicate prefixes and trailing slashes
  const cleanPath = pathname
    .replace(/^\/app/, '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');

  // Handle root path redirect
  if (cleanPath === '' || cleanPath === '/') {
    return NextResponse.redirect(new URL('/shopping/home', request.url));
  }

  // Handle protected routes
  const routeConfig = protectedRoutes.find((route) =>
    cleanPath.startsWith(route.path)
  );

  if (routeConfig) {
    if (!token) {
      const unauthUrl = new URL("/unauth-page", request.url);
      unauthUrl.searchParams.set("returnUrl", cleanPath);
      const response = NextResponse.redirect(unauthUrl);
      response.cookies.delete('token');
      return response;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-auth`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
    
      if (!response.ok) {
        const unauthUrl = new URL("/unauth-page", request.url);
        unauthUrl.searchParams.set("returnUrl", cleanPath);
        const response = NextResponse.redirect(unauthUrl);
        response.cookies.delete('token');
        return response;
      }
    
      const userData = await response.json();
    
      if (!routeConfig.roles.includes(userData.user?.role)) {
        return NextResponse.redirect(new URL("/unauth-page", request.url));
      }
    } catch (error) {
      const unauthUrl = new URL("/unauth-page", request.url);
      unauthUrl.searchParams.set("returnUrl", cleanPath);
      return NextResponse.redirect(unauthUrl);
    }
  }

  // Handle not-found routes
  if (!protectedRoutes.some((r) => cleanPath.startsWith(r.path))) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  return NextResponse.next();
}