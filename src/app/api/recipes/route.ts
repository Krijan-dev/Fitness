import { NextRequest, NextResponse } from "next/server";
import { mockRecipeProvider } from "@/services/recipes/mock-recipe.provider";
import type { RecipeSearchParams } from "@/types/recipe";

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

    if (provider === "mock") {
      const recipes = await mockRecipeProvider.searchRecipes(params);
      return NextResponse.json({ data: recipes, source: "mock" });
    }

    // Future: external provider via server-side API key
    return NextResponse.json(
      { error: "Recipe provider not configured. Set RECIPE_API_PROVIDER=mock." },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch recipes." },
      { status: 500 }
    );
  }
}
