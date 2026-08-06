import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return jsonError(error.message, error.status);
  }
  if (error instanceof ZodError) {
    const message = error.issues.map((i) => i.message).join(", ") || "Invalid input";
    return jsonError(message, 400);
  }
  if (error instanceof Error && error.message.includes("MONGODB_URI")) {
    return jsonError("Database is not configured", 503);
  }
  console.error(error);
  return jsonError("Internal server error", 500);
}
