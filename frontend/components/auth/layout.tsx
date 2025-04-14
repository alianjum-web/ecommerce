import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side (Welcome Message) */}
      <div className="hidden lg:flex items-center justify-center bg-black w-1/2 px-12">
        <div className="max-w-md space-y-6 text-center text-primary-foreground">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome to ECommerce Shopping
          </h1>
        </div>
      </div>

      {/* Right Side (Authentication Forms) */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

/*
Uses React.FC with ReactNode for children instead of Outlet (since react-router-dom is not used in Next.js).

Improves accessibility and semantics.

Follows Next.js standards with import type.Key Improvements:
✅ Replaces Outlet with children (as Next.js uses children in layout components).
✅ Adds AuthLayoutProps for TypeScript safety.
✅ Uses React.FC<AuthLayoutProps> for better readability and typings.
✅ Improves semantic structure for better maintainability.


*/