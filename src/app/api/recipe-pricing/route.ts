import { NextRequest, NextResponse } from "next/server";
import {
  getThemealdbMealById,
  searchThemealdbMeals,
} from "@/services/recipes/themealdb.client";
import { priceThemealdbMeal } from "@/services/prices/recipe-pricing.service";

/**
 * Free Recipe Pricing API (TheMealDB — no paid keys).
 *
 * GET ?q=chicken           → search meals
 * GET ?mealId=52772&location=Canberra → price ingredients across Coles/WW/ALDI
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const mealId = searchParams.get("mealId");
    const q = searchParams.get("q") ?? searchParams.get("searchTerm");
    const location = searchParams.get("location") || "Canberra";

    if (mealId) {
      const meal = await getThemealdbMealById(mealId);
      if (!meal) {
        return NextResponse.json(
          { error: "Meal not found on TheMealDB." },
          { status: 404 }
        );
      }
      const pricing = await priceThemealdbMeal(meal, location);
      return NextResponse.json({
        data: pricing,
        provider: "themealdb",
        billing: "free",
      });
    }

    if (!q || !q.trim()) {
      return NextResponse.json(
        { error: "Provide q (search) or mealId." },
        { status: 400 }
      );
    }

    const meals = await searchThemealdbMeals(q.trim());
    return NextResponse.json({
      data: meals,
      provider: "themealdb",
      billing: "free",
      endpoint: "https://www.themealdb.com/api/json/v1/1/search.php",
    });
  } catch (error) {
    console.error("Recipe pricing API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe pricing data." },
      { status: 500 }
    );
  }
}
