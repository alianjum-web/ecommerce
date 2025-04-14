// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const adminRoutes = ["/admin"]
const authRoutes = ["/shopping/account", "/shopping/checkout"]
const publicRoutes = ["/", "/shopping", "/shopping/listing", "/shopping/search"]

// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Remove the basePath from the pathname before checking
  const cleanPathname = pathname.replace(/^\/app/, '')
  const token = request.cookies.get('token')?.value

  // Skip API routes and static files
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Handle auth routes - use cleanPathname for checks
  if (authRoutes.some(route => cleanPathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/app/auth/login', request.url)
    loginUrl.searchParams.set('redirect', cleanPathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Handle admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // Verify user role (you might need to call your API here)
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-auth`, {
      headers: {
        Cookie: `token=${token}`
      }
    })
    
    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    const userData = await userResponse.json()
    if (!["admin", "seller"].includes(userData.user?.role)) {
      return NextResponse.redirect(new URL('/unauth-page', request.url))
    }
  }

  return NextResponse.next()
}