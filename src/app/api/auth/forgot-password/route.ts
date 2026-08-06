import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations";
import { jsonOk, handleApiError } from "@/lib/api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { jsonError } from "@/lib/api";

/**
 * Stub forgot-password endpoint. Always returns success to avoid email enumeration.
 * Password reset emails can be wired to a provider later.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limited = rateLimit(`forgot:${ip}`, 5, 60_000);
    if (!limited.success) {
      return jsonError("Too many requests. Try again later.", 429);
    }

    const body = await request.json();
    forgotPasswordSchema.parse(body);

    return jsonOk({
      message:
        "If an account exists for that email, password reset instructions will be sent.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
