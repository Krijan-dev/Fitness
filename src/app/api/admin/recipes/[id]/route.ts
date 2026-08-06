import { NextRequest } from "next/server";
import { Recipe } from "@/models/Recipe";
import { withAdmin } from "@/lib/route-auth";
import { recipeUpdateSchema } from "@/lib/validations";
import { toClientRecipe } from "@/lib/mappers";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";
import { generateId } from "@/utils/ids";
import mongoose from "mongoose";

async function findRecipe(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byId = await Recipe.findById(id);
    if (byId) return byId;
  }
  return Recipe.findOne({ clientId: id });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await withAdmin(request);
    const { id } = await context.params;
    const doc = await findRecipe(id);
    if (!doc) return jsonError("Recipe not found", 404);
    return jsonOk({ data: { ...toClientRecipe(doc), mongoId: doc._id.toString() } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await withAdmin(request);
    const { id } = await context.params;
    const body = await request.json();

    if (body.action === "duplicate") {
      const source = await findRecipe(id);
      if (!source) return jsonError("Recipe not found", 404);
      const copy = await Recipe.create({
        userId: source.userId,
        clientId: generateId(),
        title: `${source.title} (copy)`,
        category: source.category,
        description: source.description,
        cuisine: source.cuisine,
        difficulty: source.difficulty,
        ingredients: source.ingredients,
        instructions: source.instructions,
        nutrition: source.nutrition,
        cookedWeight: source.cookedWeight,
        servingSize: source.servingSize,
        servings: source.servings,
        prepTimeMinutes: source.prepTimeMinutes,
        cookTimeMinutes: source.cookTimeMinutes,
        notes: source.notes,
        favourite: false,
        imageUrl: source.imageUrl,
        ownerType: source.ownerType || "admin",
        visibility: source.visibility || "public",
        status: "draft",
      });
      return jsonOk({ data: toClientRecipe(copy) }, 201);
    }

    const data = recipeUpdateSchema.parse(body);
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.title = data.name;
    if (data.category !== undefined) update.category = data.category;
    if (data.description !== undefined) update.description = data.description;
    if (data.cuisine !== undefined) update.cuisine = data.cuisine;
    if (data.difficulty !== undefined) update.difficulty = data.difficulty;
    if (data.ingredients !== undefined) update.ingredients = data.ingredients;
    if (data.instructions !== undefined) update.instructions = data.instructions;
    if (data.totalNutrition !== undefined) update.nutrition = data.totalNutrition;
    if (data.cookedWeight !== undefined) update.cookedWeight = data.cookedWeight;
    if (data.servingSize !== undefined) update.servingSize = data.servingSize;
    if (data.servings !== undefined) update.servings = data.servings;
    if (data.prepTimeMinutes !== undefined)
      update.prepTimeMinutes = data.prepTimeMinutes;
    if (data.cookTimeMinutes !== undefined)
      update.cookTimeMinutes = data.cookTimeMinutes;
    if (data.notes !== undefined) update.notes = data.notes;
    if (data.imageUrl !== undefined) update.imageUrl = data.imageUrl;
    if (data.visibility !== undefined) update.visibility = data.visibility;
    if (data.status !== undefined) update.status = data.status;
    if (data.isFavourite !== undefined) update.favourite = data.isFavourite;

    const doc = await findRecipe(id);
    if (!doc) return jsonError("Recipe not found", 404);
    Object.assign(doc, update);
    await doc.save();
    return jsonOk({ data: toClientRecipe(doc) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await withAdmin(request);
    const { id } = await context.params;
    const doc = await findRecipe(id);
    if (!doc) return jsonError("Recipe not found", 404);
    await doc.deleteOne();
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
