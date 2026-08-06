import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "mealprep_token";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/meal-calculator",
  "/calculator",
  "/recipes",
  "/discover",
  "/daily-tracker",
  "/tracker",
  "/meal-planner",
  "/planner",
  "/shopping-list",
  "/shopping",
  "/pantry",
  "/price-comparison",
  "/prices",
  "/weight-tracker",
  "/weight",
  "/settings",
  "/admin",
];

const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

interface EdgePayload {
  userId?: string;
  email?: string;
  role?: string;
  name?: string;
  exp?: number;
}

function base64UrlToBytes(input: string): Uint8Array {
  const padded =
    input.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (input.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyHs256Jwt(token: string): Promise<EdgePayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToBytes(signatureB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature.buffer as ArrayBuffer,
      data
    );
    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson) as EdgePayload;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    if (!payload.userId) return null;
    return payload;
  } catch {
    return null;
  }
}

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifyHs256Jwt(token) : null;

  if (isProtected(pathname)) {
    if (!session?.userId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(
        new URL("/dashboard?error=forbidden", request.url)
      );
    }
  }

  if (AUTH_PAGES.includes(pathname) && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/meal-calculator/:path*",
    "/calculator/:path*",
    "/recipes/:path*",
    "/discover/:path*",
    "/daily-tracker/:path*",
    "/tracker/:path*",
    "/meal-planner/:path*",
    "/planner/:path*",
    "/shopping-list/:path*",
    "/shopping/:path*",
    "/pantry/:path*",
    "/price-comparison/:path*",
    "/prices/:path*",
    "/weight-tracker/:path*",
    "/weight/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
