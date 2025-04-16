// app/auth/login/page.tsx
'use client'

import { useSearchParams } from 'next/navigation';
import AuthLogin from "@/components/auth/AuthLogin";
import { isUserRole, UserRole } from '@/utils/auth';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/'; // Handle null case
  const roleParam = searchParams.get('requiredRole');
  
  // Validate the role parameter (now handles null properly)
  const requiredRole = isUserRole(roleParam) ? (roleParam as UserRole | null) : undefined;

  return <AuthLogin redirect={redirect} requiredRole={requiredRole ?? undefined} />;
}