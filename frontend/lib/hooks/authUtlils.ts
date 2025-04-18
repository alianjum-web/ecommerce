// lib/hook/authUtils.ts
import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers'
import type { User } from '@/utils/types'
import { AuthError } from '../errors/auth-error';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();
    
    const response = await axios.get<{ user: User }>(`${BASE_URL}/api/auth/check-auth`, {
      withCredentials: true,
      headers: {
        Cookie: cookieString
      }
    });
    
    return response.data.user;
  } catch (error: unknown) {
    // Proper error handling with type checking
    if (error instanceof AxiosError) {
      console.error('Auth check failed:', error.response?.status, error.message);
    } else if (error instanceof Error) {
      console.error('Unexpected error:', error.message);
    }
    return null;
  }
}

export async function checkAuth(redirectPath?: string): Promise<User> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new AuthError(
        'Authentication required',
        redirectPath || '/auth/login'
      );
    }
    
    return user;
  } catch (error) {
    // Convert any unexpected errors to AuthError
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError(
      'Authentication check failed',
      redirectPath || '/auth/login'
    );
  }
}

export async function checkAdminAccess(): Promise<User | null> {
  const user = await getCurrentUser()
  
  if (!user || !['admin', 'seller'].includes(user.role)) {
    return null
  }
  
  return user
}
