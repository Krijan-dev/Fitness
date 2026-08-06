import { NextRequest, NextResponse } from "next/server";
import { mockRecipeProvider } from "@/services/recipes/mock-recipe.provider";
import type { DiscoveredRecipe, RecipeSearchParams } from "@/types/recipe";
import { connectMongo } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { toClientRecipe } from "@/lib/mappers";

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
    proteinPerServing: Math.round((recipe.totalNutrition.protein / servings) * 10) / 10,
    carbsPerServing: Math.round((recipe.totalNutrition.carbs / servings) * 10) / 10,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const provider = process.env.RECIPE_API_PROVIDER || "mock";

    const params: RecipeSearchParams = {
      query: searchParams.get("query") || undefined,
      cuisine: searchParams.get("cuisine") || undefined,
      mealType: searchParams.get("mealType") || undefined,
      maxCalories: searchParams.get("maxCalories")
        ? Number(searchParams.get("maxCalories"))
        : undefined,
      minProtein: searchParams.get("minProtein")
        ? Number(searchParams.get("minProtein"))
        : undefined,
      maxCookTime: searchParams.get("maxCookTime")
        ? Number(searchParams.get("maxCookTime"))
        : undefined,
      dietaryTags: searchParams.get("dietaryTags")
        ? searchParams.get("dietaryTags")!.split(",").filter(Boolean)
        : undefined,
    };

    let recipes: DiscoveredRecipe[] = [];

    if (provider === "mock") {
      recipes = await mockRecipeProvider.searchRecipes(params);
    }

    try {
      await connectMongo();
      const adminDocs = await Recipe.find({
        ownerType: "admin",
        visibility: "public",
        status: "published",
      }).sort({ createdAt: -1 });

      let adminRecipes = adminDocs.map((d) => toDiscovered(toClientRecipe(d)));
      if (params.query) {
        const q = params.query.toLowerCase();
        adminRecipes = adminRecipes.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        );
      }
      if (params.cuisine) {
        adminRecipes = adminRecipes.filter(
          (r) => r.cuisine?.toLowerCase() === params.cuisine?.toLowerCase()
        );
      }
      if (params.maxCalories) {
        adminRecipes = adminRecipes.filter(
          (r) => r.caloriesPerServing <= params.maxCalories!
        );
      }
      if (params.minProtein) {
        adminRecipes = adminRecipes.filter(
          (r) => r.proteinPerServing >= params.minProtein!
        );
      }
      if (params.maxCookTime) {
        adminRecipes = adminRecipes.filter(
          (r) => r.cookTimeMinutes <= params.maxCookTime!
        );
      }
      recipes = [...adminRecipes, ...recipes];
    } catch {
      // Mongo optional for discover when DB unavailable
    }

    return NextResponse.json({ data: recipes, source: "mixed" });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch recipes." },
      { status: 500 }
    );
  }
}
