import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "@/env";

export const AUTH_COOKIE = "mealprep_token";
export const JWT_EXPIRES_IN = "7d";
export const JWT_EXPIRES_SECONDS = 60 * 60 * 24 * 7;
export const BCRYPT_ROUNDS = 12;

/** Dummy bcrypt hash used so missing users still pay for bcrypt.compare (user enumeration). */
export const DUMMY_PASSWORD_HASH =
  "$2b$12$VPz.JFgRYNSnqI.lPl2LgObr7O6I00mh4dLUP0WyqNVClB7ETi1me";

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function isBcryptHash(value: string | undefined | null): value is string {
  return Boolean(value && BCRYPT_HASH.test(value));
}

export type UserRole = "user" | "admin";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  disabled?: boolean;
  onboardingCompleted?: boolean;
}

function getJwtSecret(): string {
  const secret = env.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error("Password is required");
  }
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** Constant-time bcrypt comparison (bcrypt.compare). */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  const hash = isBcryptHash(passwordHash) ? passwordHash : DUMMY_PASSWORD_HASH;
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_SECONDS,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    if (!decoded?.userId || !decoded?.email || !decoded?.role) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function setAuthCookie(
  response: NextResponse,
  token: string
): NextResponse {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: JWT_EXPIRES_SECONDS,
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(AUTH_COOKIE)?.value ?? null;
}

export async function getSessionFromCookies(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getSessionFromRequest(request: NextRequest): JwtPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function requireUser(request: NextRequest): JwtPayload {
  const session = getSessionFromRequest(request);
  if (!session) {
    throw new AuthError("Unauthorized", 401);
  }
  return session;
}

export function requireAdmin(request: NextRequest): JwtPayload {
  const session = requireUser(request);
  if (session.role !== "admin") {
    throw new AuthError("Access denied", 403);
  }
  return session;
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
