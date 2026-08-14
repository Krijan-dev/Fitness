import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import {
  hashPassword,
  signToken,
  setAuthCookie,
  type PublicUser,
} from "@/lib/auth";
import { User } from "@/models/User";
import { UserSettings } from "@/models/UserSettings";
import { registerSchema } from "@/lib/validations";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limited = rateLimit(`register:${ip}`, 5, 60_000);
    if (!limited.success) {
      return jsonError("Too many registration attempts. Try again later.", 429);
    }

    const body = await request.json();
    const data = registerSchema.parse(body);

    await connectMongo();

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(data.password);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: "user",
      lastActivityAt: new Date(),
    });

    await UserSettings.create({
      userId: user._id,
      profile: { displayName: data.name },
    });

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
      onboardingCompleted: false,
    };

    const response = jsonOk({ user: publicUser }, 201);
    return setAuthCookie(response, token);
  } catch (error) {
    return handleApiError(error);
  }
}
