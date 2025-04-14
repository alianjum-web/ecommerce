// app/auth/login/page.tsx
import AuthLogin from "@/components/auth/AuthLogin";

interface PageProps {
  searchParams: { 
    redirect?: string;
    requiredRole?: string;
  };
}

export default function LoginPage({ searchParams }: PageProps) {
  const { redirect = "/", requiredRole } = searchParams;
  
  return <AuthLogin redirect={redirect} requiredRole={requiredRole} />;
}