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

interface EdgePayload {
  userId?: string;
  email?: string;
  role?: string;
  name?: string;
}

async function verifySession(
  token: string
): Promise<EdgePayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is missing in middleware");
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    const data = payload as EdgePayload;
    if (!data.userId) return null;
    return data;
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
  const session = token ? await verifySession(token) : null;

  if (isProtected(pathname)) {
    if (!session?.userId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid cookie so the client does not loop
      if (token) {
        response.cookies.set(AUTH_COOKIE, "", {
          httpOnly: true,
          path: "/",
          maxAge: 0,
        });
      }
      return response;
    }

    if (pathname.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(
        new URL("/dashboard?error=forbidden", request.url)
      );
    }
  }

  if (AUTH_PAGES.includes(pathname) && session?.userId) {
    const next = request.nextUrl.searchParams.get("next");
    const dest =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
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
    "/admin",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
