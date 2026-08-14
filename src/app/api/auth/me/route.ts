import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { getSessionFromRequest, type PublicUser } from "@/lib/auth";
import { User } from "@/models/User";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { getOnboardingCompleted } from "@/services/onboarding/onboarding.service";

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    await connectMongo();
    const user = await User.findById(session.userId).select(
      "name email role disabled createdAt"
    );

    if (!user || user.disabled) {
      return jsonError("Unauthorized", 401);
    }

    const publicUser: PublicUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as "user" | "admin",
      createdAt: user.createdAt?.toISOString?.(),
      onboardingCompleted: await getOnboardingCompleted(user._id.toString()),
    };

    return jsonOk({ user: publicUser });
  } catch (error) {
    return handleApiError(error);
  }
}
