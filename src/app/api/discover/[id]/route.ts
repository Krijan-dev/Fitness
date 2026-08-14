import { NextRequest, NextResponse } from "next/server";
import { mockRecipeProvider } from "@/services/recipes/mock-recipe.provider";
import { themealdbRecipeProvider } from "@/services/recipes/themealdb.provider";
import { connectMongo } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { toClientRecipe } from "@/lib/mappers";
import type { DiscoveredRecipe } from "@/types/recipe";

function toDiscovered(recipe: ReturnType<typeof toClientRecipe>): DiscoveredRecipe {
  const servings = Math.max(recipe.servings || 1, 1);
  return {
    id: `admin-${recipe.id}`,
    title: recipe.name,
    description: recipe.description || "",
    imageUrl: recipe.imageUrl,
    cuisine: recipe.cuisine,
    mealType: recipe.category,
    prepTimeMinutes: recipe.prepTimeMinutes || 0,
    cookTimeMinutes: recipe.cookTimeMinutes || 0,
    servings,
    caloriesPerServing: Math.round(recipe.totalNutrition.calories / servings),
    proteinPerServing:
      Math.round((recipe.totalNutrition.protein / servings) * 10) / 10,
    carbsPerServing:
      Math.round((recipe.totalNutrition.carbs / servings) * 10) / 10,
    fatPerServing: Math.round((recipe.totalNutrition.fat / servings) * 10) / 10,
    ingredients: recipe.ingredients,
    instructions: (recipe.instructions || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    dietaryTags: [],
    difficulty: recipe.difficulty,
    source: "MealPrep Pro",
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (id.startsWith("admin-")) {
      const clientId = id.replace(/^admin-/, "");
      await connectMongo();
      const doc = await Recipe.findOne({
        clientId,
        ownerType: "admin",
        visibility: "public",
        status: "published",
      });
      if (!doc) {
        return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
      }
      return NextResponse.json({
        data: toDiscovered(toClientRecipe(doc)),
      });
    }

    if (id.startsWith("themealdb-") || /^\d+$/.test(id)) {
      const recipe = await themealdbRecipeProvider.getRecipeById(id);
      if (!recipe) {
        return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
      }
      return NextResponse.json({
        data: recipe,
      });
    }

    const provider = (process.env.RECIPE_API_PROVIDER || "themealdb").toLowerCase();

    if (provider === "themealdb" || provider === "auto") {
      const recipe = await themealdbRecipeProvider.getRecipeById(id);
      if (recipe) {
        return NextResponse.json({
          data: recipe,
        });
      }
    }

    if (provider === "mock" || provider === "themealdb" || provider === "auto") {
      const recipe = await mockRecipeProvider.getRecipeById(id);
      if (recipe) {
        return NextResponse.json({ data: recipe });
      }
    }

    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch recipe." },
      { status: 500 }
    );
  }
}
