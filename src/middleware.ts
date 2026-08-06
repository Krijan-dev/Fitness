import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

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

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function verifyEdgeToken(token: string) {
  const secret = getSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as {
      userId?: string;
      email?: string;
      role?: string;
      name?: string;
    };
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
  const session = token ? await verifyEdgeToken(token) : null;

  if (isProtected(pathname)) {
    if (!session?.userId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
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
