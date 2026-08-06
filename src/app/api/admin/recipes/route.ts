import { NextRequest } from "next/server";
import { Recipe } from "@/models/Recipe";
import { User } from "@/models/User";
import { withAdmin } from "@/lib/route-auth";
import { toClientRecipe } from "@/lib/mappers";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(request.nextUrl.searchParams.get("limit") || 20))
    );
    const skip = (page - 1) * limit;
    const q = request.nextUrl.searchParams.get("q")?.trim();

    const filter = q ? { title: { $regex: q, $options: "i" } } : {};
    const [docs, total] = await Promise.all([
      Recipe.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Recipe.countDocuments(filter),
    ]);

    const userIds = [...new Set(docs.map((d) => d.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select("name email");
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return jsonOk({
      data: docs.map((doc) => ({
        ...toClientRecipe(doc),
        userId: doc.userId.toString(),
        user: userMap.get(doc.userId.toString())
          ? {
              name: userMap.get(doc.userId.toString())!.name,
              email: userMap.get(doc.userId.toString())!.email,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
