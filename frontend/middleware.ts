import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const publicRoutes = [
  "/shopping/home",
  "/shopping/listing",
  "/shopping/search",
];

const protectedRoutes = [
  { path: "/shopping/account", roles: ["buyer", "seller", "admin"] },
  { path: "/shopping/checkout", roles: ["buyer", "seller", "admin"] },
  { path: "/shopping/payment-auccess", roles: ["buyer", "seller", "admin"] },
  { path: "/shopping/payment-return", roles: ["buyer", "seller", "admin"] },
  { path: "/admin", roles: ["seller", "admin"] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Skip API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle root path redirect
  // if (pathname === '/' || pathname === '/app') {
  //   return NextResponse.redirect(new URL('/app/shopping/home', request.url))
  // }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/shopping/home", request.url));
  }

  // Remove basePath for matching
  // const cleanPath = pathname.replace(/^\/app/, '');
  const cleanPath = pathname;
  //check if the route is public
  const isPublic = publicRoutes.some((route) => cleanPath.startsWith(route));

  if (!isPublic) {
    const routeConfig = protectedRoutes.find((route) =>
      cleanPath.startsWith(route.path)
    );

    if (routeConfig) {
      if (!token) {
        const unauthUrl = new URL("/unauth-page", request.url);
        return NextResponse.redirect(unauthUrl);
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-auth`,
          {
            headers: {
              Cookie: `token=${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Unauthorized");

        const userData = await response.json();

        if (!routeConfig.roles.includes(userData.user?.role)) {
          return NextResponse.redirect(
            new URL("/app/unauth-page", request.url)
          );
        }
      } catch (error) {
        const unauthUrl = new URL("/app/unauth-page", request.url);
        unauthUrl.searchParams.set("returnUrl", cleanPath);
        return NextResponse.redirect(unauthUrl);
      }
    }
  }

  // Handle not-found routes
  if (!isPublic && !protectedRoutes.some((r) => cleanPath.startsWith(r.path))) {
    return NextResponse.redirect(new URL("/app/not-found", request.url));
  }

  return NextResponse.next();
}
