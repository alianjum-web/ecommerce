// lib/api/apiClient.ts
import axios, { AxiosError } from 'axios'
import { cookies } from 'next/headers'
import { AuthError } from '@/lib/errors/auth-error'
import { useAppSelector } from '@/store/hooks'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

// Server-side API client
export async function serverApiClient() {
  const cookieStore = cookies()
  const resolvedCookies = await cookieStore;
  const token = resolvedCookies.get('token')?.value;

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Cookie: `token=${token}` })
    }
  })

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        throw new AuthError('Unauthorized', window.location.pathname)
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// Client-side API hooks
export function useApiClient() {
  const { user } = useAppSelector((state) => state.auth) as { user: { token?: string } }

  const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
  })

  client.interceptors.request.use((config) => {
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  })

  return client
}