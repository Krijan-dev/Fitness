import { NextRequest } from "next/server";
import { Recipe } from "@/models/Recipe";
import { withAuth } from "@/lib/route-auth";
import { recipeUpdateSchema } from "@/lib/validations";
import { toClientRecipe } from "@/lib/mappers";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await withAuth(request);
    const { id } = await context.params;
    const filter: Record<string, unknown> = {
      userId: session.userId,
      clientId: id,
    };

    let doc = await Recipe.findOne(filter);
    if (!doc && mongoose.Types.ObjectId.isValid(id)) {
      doc = await Recipe.findOne({ userId: session.userId, _id: id });
    }
    if (!doc) return jsonError("Recipe not found", 404);
    return jsonOk({ data: toClientRecipe(doc) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await withAuth(request);
    const { id } = await context.params;
    const body = await request.json();
    const data = recipeUpdateSchema.parse(body);

    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.title = data.name;
    if (data.category !== undefined) update.category = data.category;
    if (data.description !== undefined) update.description = data.description;
    if (data.ingredients !== undefined) update.ingredients = data.ingredients;
    if (data.totalNutrition !== undefined) update.nutrition = data.totalNutrition;
    if (data.cookedWeight !== undefined) update.cookedWeight = data.cookedWeight;
    if (data.servingSize !== undefined) update.servingSize = data.servingSize;
    if (data.servings !== undefined) update.servings = data.servings;
    if (data.prepTimeMinutes !== undefined)
      update.prepTimeMinutes = data.prepTimeMinutes;
    if (data.cookTimeMinutes !== undefined)
      update.cookTimeMinutes = data.cookTimeMinutes;
    if (data.notes !== undefined) update.notes = data.notes;
    if (data.isFavourite !== undefined) update.favourite = data.isFavourite;
    if (data.imageUrl !== undefined) update.imageUrl = data.imageUrl;

    const doc = await Recipe.findOneAndUpdate(
      { userId: session.userId, clientId: id },
      { $set: update },
      { new: true }
    );

    if (!doc) return jsonError("Recipe not found", 404);
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
    const session = await withAuth(request);
    const { id } = await context.params;
    const result = await Recipe.deleteOne({
      userId: session.userId,
      clientId: id,
    });
    if (result.deletedCount === 0) return jsonError("Recipe not found", 404);
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
