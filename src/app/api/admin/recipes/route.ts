import { NextRequest } from "next/server";
import { Recipe } from "@/models/Recipe";
import { User } from "@/models/User";
import { withAdmin } from "@/lib/route-auth";
import { recipeCreateSchema } from "@/lib/validations";
import { toClientRecipe } from "@/lib/mappers";
import { jsonOk, handleApiError } from "@/lib/api";
import { generateId } from "@/utils/ids";

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
    const status = request.nextUrl.searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (q) filter.title = { $regex: q, $options: "i" };
    if (status === "draft" || status === "published") filter.status = status;

    const [docs, total] = await Promise.all([
      Recipe.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Recipe.countDocuments(filter),
    ]);

    const userIds = [
      ...new Set(docs.map((d) => d.userId?.toString()).filter(Boolean)),
    ] as string[];
    const users = await User.find({ _id: { $in: userIds } }).select("name email");
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return jsonOk({
      data: docs.map((doc) => ({
        ...toClientRecipe(doc),
        mongoId: doc._id.toString(),
        userId: doc.userId?.toString() || null,
        user: doc.userId
          ? userMap.get(doc.userId.toString())
            ? {
                name: userMap.get(doc.userId.toString())!.name,
                email: userMap.get(doc.userId.toString())!.email,
              }
            : null
          : { name: "Admin", email: "platform" },
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

export async function POST(request: NextRequest) {
  try {
    const session = await withAdmin(request);
    const body = await request.json();
    const data = recipeCreateSchema.parse(body);
    const clientId = typeof body.id === "string" ? body.id : generateId();

    const doc = await Recipe.create({
      userId: session.userId,
      clientId,
      title: data.name,
      category: data.category,
      description: data.description,
      cuisine: data.cuisine,
      difficulty: data.difficulty,
      ingredients: data.ingredients,
      instructions: data.instructions || "",
      nutrition: data.totalNutrition,
      cookedWeight: data.cookedWeight,
      servingSize: data.servingSize || 100,
      servings: data.servings || 1,
      prepTimeMinutes: data.prepTimeMinutes,
      cookTimeMinutes: data.cookTimeMinutes,
      notes: data.notes,
      favourite: false,
      imageUrl: data.imageUrl,
      ownerType: "admin",
      visibility: data.visibility || "public",
      status: data.status || "draft",
    });

    return jsonOk({ data: toClientRecipe(doc) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
