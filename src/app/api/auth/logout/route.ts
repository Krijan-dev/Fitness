import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);
  return response;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  clearAuthCookie(response);
  return response;
}
