import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "mealprep_token";

const USER_APP_PREFIXES = [
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
];

const PROTECTED_PREFIXES = [...USER_APP_PREFIXES, "/admin"];

const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

interface EdgePayload {
  userId?: string;
  email?: string;
  role?: string;
  name?: string;
}

async function verifySession(token: string): Promise<EdgePayload | null> {
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

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  const isAdmin = session?.role === "admin";

  // Home: send admins to portal, users to dashboard
  if (pathname === "/") {
    if (!session?.userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", request.url)
    );
  }

  // Admins stay in the admin portal — do not load user app pages
  if (isAdmin && matchesPrefix(pathname, USER_APP_PREFIXES)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    if (!session?.userId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.set(AUTH_COOKIE, "", {
          httpOnly: true,
          path: "/",
          maxAge: 0,
        });
      }
      return response;
    }

    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(
        new URL("/dashboard?error=forbidden", request.url)
      );
    }
  }

  if (AUTH_PAGES.includes(pathname) && session?.userId) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    const next = request.nextUrl.searchParams.get("next");
    const dest =
      next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/admin")
        ? next
        : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
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
