import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import {
  verifyPassword,
  signToken,
  setAuthCookie,
  type PublicUser,
} from "@/lib/auth";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getOnboardingCompleted } from "@/services/onboarding/onboarding.service";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limited = rateLimit(`login:${ip}`, 10, 60_000);
    if (!limited.success) {
      return jsonError("Too many login attempts. Try again later.", 429);
    }

    const body = await request.json();
    const data = loginSchema.parse(body);

    await connectMongo();

    const user = await User.findOne({ email: data.email }).select(
      "+passwordHash name email role disabled createdAt"
    );

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }

    if (user.disabled) {
      return jsonError("This account has been disabled", 403);
    }

    user.lastActivityAt = new Date();
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as "user" | "admin",
      name: user.name,
    });

    const publicUser: PublicUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as "user" | "admin",
      createdAt: user.createdAt?.toISOString?.(),
      onboardingCompleted: await getOnboardingCompleted(user._id.toString()),
    };

    const response = jsonOk({ user: publicUser });
    return setAuthCookie(response, token);
  } catch (error) {
    return handleApiError(error);
  }
}
