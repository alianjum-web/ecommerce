// app/api/auth/[...auth]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const path = req.nextUrl.searchParams.get('path') || 'login'
    
    const response = await axios.post(`${BASE_URL}/api/auth/${path}`, body, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Cookie: req.cookies.toString() || ''
      }
    })

    const nextResponse = NextResponse.json(response.data)
    
    // Set cookies from backend
    const cookies = response.headers['set-cookie']
    if (cookies) {
      cookies.forEach(cookie => {
        nextResponse.headers.append('Set-Cookie', cookie)
      })
    }

    return nextResponse
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || 'Authentication failed' },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const path = req.nextUrl.searchParams.get('path') || 'check-auth'
    
    const response = await axios.get(`${BASE_URL}/api/auth/${path}`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Cookie: req.cookies.toString() || ''
      }
    })

    const nextResponse = NextResponse.json(response.data)
    
    // Set cookies from backend
    const cookies = response.headers['set-cookie']
    if (cookies) {
      cookies.forEach(cookie => {
        nextResponse.headers.append('Set-Cookie', cookie)
      })
    }

    return nextResponse
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || 'Authentication check failed' },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}