import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { JwtPayload } from "@/lib/auth";

export async function touchUserActivity(userId: string): Promise<void> {
  try {
    await connectMongo();
    await User.findByIdAndUpdate(userId, { lastActivityAt: new Date() });
  } catch {
    // Non-critical
  }
}

export async function assertUserActive(session: JwtPayload): Promise<void> {
  await connectMongo();
  const user = await User.findById(session.userId).select("disabled");
  if (!user || user.disabled) {
    const { AuthError } = await import("@/lib/auth");
    throw new AuthError(user?.disabled ? "Account disabled" : "Unauthorized", 401);
  }
}
