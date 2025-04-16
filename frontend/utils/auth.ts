export type LoginFormData = {
  email: string;
  password: string;
  // Optionally, you might include:
  rememberMe?: boolean; // For "remember me" functionality
};

export type RegisterFormData = {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};


// types/auth.ts (or anywhere in your type definitions)
// types/auth.ts
export type UserRole = 'admin' | 'seller' | 'buyer';

export const USER_ROLES: UserRole[] = ['admin', 'seller', 'buyer'];

// Updated to handle null values
export function isUserRole(role: string | null | undefined): role is UserRole {
  if (role === null || role === undefined) return true; // Allow undefined/null
  return USER_ROLES.includes(role as UserRole);
}