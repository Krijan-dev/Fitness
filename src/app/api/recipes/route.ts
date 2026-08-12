import { NextRequest } from "next/server";
import { Recipe } from "@/models/Recipe";
import { withAuth } from "@/lib/route-auth";
import { recipeCreateSchema } from "@/lib/validations";
import { toClientRecipe } from "@/lib/mappers";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";
import { generateId } from "@/utils/ids";

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const docs = await Recipe.find({
      userId: session.userId,
      ownerType: { $ne: "admin" },
    }).sort({ updatedAt: -1 });
    return jsonOk({ data: docs.map(toClientRecipe) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const data = recipeCreateSchema.parse(body);
    const clientId = typeof body.id === "string" ? body.id : generateId();

    const existing = await Recipe.findOne({
      userId: session.userId,
      clientId,
    });
    if (existing) {
      return jsonError("Recipe already exists", 409);
    }

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
      servingSize: data.servingSize,
      servings: data.servings,
      prepTimeMinutes: data.prepTimeMinutes,
      cookTimeMinutes: data.cookTimeMinutes,
      notes: data.notes,
      favourite: data.isFavourite ?? false,
      imageUrl: data.imageUrl,
      ownerType: "user",
      visibility: "private",
      status: "published",
    });

    return jsonOk({ data: toClientRecipe(doc) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    if (!Array.isArray(body?.recipes)) {
      return jsonError("Expected { recipes: [] }", 400);
    }

    const recipes = body.recipes as Array<Record<string, unknown>>;
    await Recipe.deleteMany({
      userId: session.userId,
      ownerType: { $ne: "admin" },
    });

    if (recipes.length > 0) {
      await Recipe.insertMany(
        recipes.map((r) => ({
          userId: session.userId,
          clientId: String(r.id || generateId()),
          title: String(r.name || "Untitled"),
          category: String(r.category || "other"),
          description: r.description,
          cuisine: r.cuisine,
          difficulty: r.difficulty,
          ingredients: r.ingredients || [],
          instructions: r.instructions || "",
          nutrition: r.totalNutrition || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
          },
          cookedWeight: r.cookedWeight,
          servingSize: Number(r.servingSize || 1),
          servings: Number(r.servings || 1),
          prepTimeMinutes: r.prepTimeMinutes,
          cookTimeMinutes: r.cookTimeMinutes,
          notes: r.notes,
          favourite: Boolean(r.isFavourite),
          imageUrl: r.imageUrl,
          ownerType: "user",
          visibility: "private",
          status: "published",
        }))
      );
    }

    const docs = await Recipe.find({
      userId: session.userId,
      ownerType: { $ne: "admin" },
    });
    return jsonOk({ data: docs.map(toClientRecipe) });
  } catch (error) {
    return handleApiError(error);
  }
}
