// app/api/auth/[...auth]/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = req.nextUrl.pathname.split("/").pop() || "login";

    // This removes any /app/ prefix if somehow it's present (maybe for futureproofing).
    // So final path is like login, register, etc.    
    const apiPath = path.replace(/^\/?app\//, "");

    const response = await axios.post(`${BASE_URL}/api/auth/${apiPath}`, body, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Cookie: req.cookies.toString() || "",
      },
    });

    const nextResponse = NextResponse.json(response.data);

    // Set cookies from backend
    const cookies = response.headers["set-cookie"];
    if (cookies) {
      cookies.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || "Authentication failed" },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Unknown error occured" },
      { status: 500 }
    );
  }
}
