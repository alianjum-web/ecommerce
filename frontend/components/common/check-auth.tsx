import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useMemo } from "react";
import { User, UserRole, ROUTE_PERMISSIONS, DEFAULT_ROUTES } from "@/utils/types";

type ProtectedRouteProps = {
  isAuthenticated: boolean;
  user: User | null;
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
};

function ProtectedRoute({
  isAuthenticated,
  user,
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const { shouldRedirect, redirectPath } = useMemo(() => {
    // Public routes accessible to all
    const publicRoutes = ["/auth/login", "/auth/register", "/"];
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));

    // 1. Handle unauthenticated users
    if (!isAuthenticated && !isPublicRoute) {
      return {
        shouldRedirect: true,
        redirectPath: "/auth/login?redirect=" + encodeURIComponent(currentPath),
      };
    }

    // 2. Handle authenticated users
    if (isAuthenticated && user) {
      // 2a. Prevent authenticated users from accessing auth pages
      if (isPublicRoute) {
        return {
          shouldRedirect: true,
          redirectPath: DEFAULT_ROUTES[user.role],
        };
      }

      // 2b. Check if route has specific role requirements
      if (requiredRole) {
        const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!requiredRoles.includes(user.role)) {
          return {
            shouldRedirect: true,
            redirectPath: "/unauthorized",
          };
        }
      }

      // 2c. General role-based route access
      const allowedRoutes = ROUTE_PERMISSIONS[user.role];
      const isRouteAllowed = allowedRoutes.some(route => currentPath.startsWith(route));

      if (!isRouteAllowed) {
        // Special case: Admin can view seller dashboards
        if (user.role === "admin" && currentPath.startsWith("/seller")) {
          return { shouldRedirect: false, redirectPath: "" };
        }
        
        // Special case: Seller can access admin routes for their own shop
        if (user.role === "seller" && currentPath.startsWith("/admin")) {
          const sellerIdFromPath = currentPath.split("/")[2]; // Extract seller ID from path
          if (sellerIdFromPath === user._id) {
            return { shouldRedirect: false, redirectPath: "" };
          }
          return {
            shouldRedirect: true,
            redirectPath: "/unauthorized",
          };
        }

        return {
          shouldRedirect: true,
          redirectPath: DEFAULT_ROUTES[user.role],
        };
      }
    }

    return { shouldRedirect: false, redirectPath: "" };
  }, [isAuthenticated, user, currentPath, requiredRole]);

  if (shouldRedirect) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;