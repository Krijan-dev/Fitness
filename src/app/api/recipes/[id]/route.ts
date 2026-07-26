import { NextRequest, NextResponse } from "next/server";
import { mockRecipeProvider } from "@/services/recipes/mock-recipe.provider";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const provider = process.env.RECIPE_API_PROVIDER || "mock";

    if (provider !== "mock") {
      return NextResponse.json(
        { error: "Recipe provider not configured. Set RECIPE_API_PROVIDER=mock." },
        { status: 503 }
      );
    }

    const recipe = await mockRecipeProvider.getRecipeById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    }

    return NextResponse.json({ data: recipe, source: "mock" });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch recipe." },
      { status: 500 }
    );
  }
}
