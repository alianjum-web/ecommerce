import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "./lib/hooks/authUtlils";

const adminRoutes = ["/admin"];
const authRoutes = ["/shopping/account", "/shopping/checkout"];
const publicRoutes = ["/", "/shopping", "/shopping/listing", "/shopping/search"];

export async function middleware(request: NextRequest) {
  const currentUser = await getCurrentUser();
  const { pathname } = request.nextUrl;

  // Redirect to login if trying to access protected route
  if (authRoutes.some(route => pathname.startsWith(route)) && !currentUser) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect to unauth page if trying to access admin without permission
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!currentUser || !["admin", "seller"].includes(currentUser.role)) {
      return NextResponse.redirect(new URL("/unauth-page", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};