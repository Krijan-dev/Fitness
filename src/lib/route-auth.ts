import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { requireUser, requireAdmin, type JwtPayload } from "@/lib/auth";
import { assertUserActive, touchUserActivity } from "@/lib/activity";

export async function withAuth(
  request: NextRequest
): Promise<JwtPayload> {
  const session = requireUser(request);
  await assertUserActive(session);
  void touchUserActivity(session.userId);
  await connectMongo();
  return session;
}

export async function withAdmin(
  request: NextRequest
): Promise<JwtPayload> {
  const session = requireAdmin(request);
  await assertUserActive(session);
  void touchUserActivity(session.userId);
  await connectMongo();
  return session;
}
