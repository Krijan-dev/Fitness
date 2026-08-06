import { NextRequest } from "next/server";
import { User } from "@/models/User";
import { Recipe } from "@/models/Recipe";
import { MealPlan } from "@/models/MealPlan";
import { ShoppingItem } from "@/models/ShoppingItem";
import { WeightEntry } from "@/models/WeightEntry";
import { withAdmin } from "@/lib/route-auth";
import { jsonOk, handleApiError } from "@/lib/api";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);

    const weekAgo = daysAgo(7);
    const thirtyAgo = daysAgo(30);

    const [
      totalUsers,
      totalRecipes,
      totalMealPlans,
      totalShoppingItems,
      totalWeightEntries,
      newUsersThisWeek,
      recentUsers,
      recentRecipes,
      activeUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      MealPlan.countDocuments(),
      ShoppingItem.countDocuments(),
      WeightEntry.countDocuments(),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.find({ createdAt: { $gte: thirtyAgo } }).select("createdAt"),
      Recipe.find({ createdAt: { $gte: thirtyAgo } }).select("createdAt"),
      User.find({ lastActivityAt: { $gte: daysAgo(56) } }).select(
        "lastActivityAt"
      ),
    ]);

    const registrationsByDay: Record<string, number> = {};
    const recipesByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i -= 1) {
      const key = daysAgo(i).toISOString().slice(0, 10);
      registrationsByDay[key] = 0;
      recipesByDay[key] = 0;
    }

    for (const u of recentUsers) {
      const key = u.createdAt?.toISOString?.().slice(0, 10);
      if (key && key in registrationsByDay) registrationsByDay[key] += 1;
    }
    for (const r of recentRecipes) {
      const key = r.createdAt?.toISOString?.().slice(0, 10);
      if (key && key in recipesByDay) recipesByDay[key] += 1;
    }

    const activeByWeek: { week: string; count: number }[] = [];
    for (let w = 7; w >= 0; w -= 1) {
      const start = daysAgo(w * 7);
      const end = daysAgo(w * 7 - 7);
      const count = activeUsers.filter((u) => {
        const t = u.lastActivityAt?.getTime?.() ?? 0;
        return t >= start.getTime() && t < end.getTime();
      }).length;
      activeByWeek.push({
        week: start.toISOString().slice(0, 10),
        count,
      });
    }

    return jsonOk({
      data: {
        totals: {
          users: totalUsers,
          recipes: totalRecipes,
          mealPlans: totalMealPlans,
          shoppingItems: totalShoppingItems,
          weightEntries: totalWeightEntries,
          newUsersThisWeek,
        },
        charts: {
          registrations: Object.entries(registrationsByDay).map(
            ([date, count]) => ({ date, count })
          ),
          recipesCreated: Object.entries(recipesByDay).map(([date, count]) => ({
            date,
            count,
          })),
          activeUsersByWeek: activeByWeek,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
