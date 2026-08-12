import { NextRequest } from "next/server";
import { MealPlan } from "@/models/MealPlan";
import { withAuth } from "@/lib/route-auth";
import { mealPlanSchema } from "@/lib/validations";
import { toClientMealPlan } from "@/lib/mappers";
import { jsonOk, handleApiError } from "@/lib/api";
import { generateId } from "@/utils/ids";
import { getWeekStart } from "@/utils/date";

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const weekStart =
      request.nextUrl.searchParams.get("weekStart") || getWeekStart();
    const doc = await MealPlan.findOne({
      userId: session.userId,
      weekStart,
    });

    if (!doc) {
      return jsonOk({
        data: {
          id: generateId(),
          weekStart,
          meals: [],
        },
      });
    }

    return jsonOk({ data: toClientMealPlan(doc) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const data = mealPlanSchema.parse(body);
    const clientId = data.clientId || body.id || generateId();

    const doc = await MealPlan.findOneAndUpdate(
      { userId: session.userId, weekStart: data.weekStart },
      {
        $set: {
          days: data.meals,
          clientId: String(clientId),
        },
        $setOnInsert: {
          userId: session.userId,
          weekStart: data.weekStart,
        },
      },
      { upsert: true, new: true }
    );

    return jsonOk({ data: toClientMealPlan(doc) });
  } catch (error) {
    return handleApiError(error);
  }
}
