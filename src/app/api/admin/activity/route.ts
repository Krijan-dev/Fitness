import { NextRequest } from "next/server";
import { User } from "@/models/User";
import { Recipe } from "@/models/Recipe";
import { withAdmin } from "@/lib/route-auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);
    const limit = Math.min(
      100,
      Math.max(1, Number(request.nextUrl.searchParams.get("limit") || 30))
    );

    const [users, recipes] = await Promise.all([
      User.find().sort({ lastActivityAt: -1 }).limit(limit).select(
        "name email role lastActivityAt createdAt"
      ),
      Recipe.find().sort({ createdAt: -1 }).limit(limit).select(
        "title userId createdAt"
      ),
    ]);

    const activity = [
      ...users.map((u) => ({
        type: "user_activity" as const,
        id: u._id.toString(),
        title: u.name,
        subtitle: u.email,
        at: u.lastActivityAt?.toISOString?.() ?? u.createdAt?.toISOString?.(),
      })),
      ...recipes.map((r) => ({
        type: "recipe_created" as const,
        id: r._id.toString(),
        title: r.title,
        subtitle: `User ${r.userId?.toString() || "unknown"}`,
        at: r.createdAt?.toISOString?.(),
      })),
    ]
      .sort((a, b) => (b.at || "").localeCompare(a.at || ""))
      .slice(0, limit);

    return jsonOk({ data: activity });
  } catch (error) {
    return handleApiError(error);
  }
}
