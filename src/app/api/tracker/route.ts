import { NextRequest } from "next/server";
import { DailyEntry } from "@/models/DailyEntry";
import { withAuth } from "@/lib/route-auth";
import { mealEntrySchema } from "@/lib/validations";
import { flattenDailyEntries } from "@/lib/mappers";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";
import { generateId } from "@/utils/ids";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const entries = await DailyEntry.find({ userId: session.userId });
    return jsonOk({ data: flattenDailyEntries(entries) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const data = mealEntrySchema.parse(body);
    const clientId = typeof body.id === "string" ? body.id : generateId();

    const entry = await DailyEntry.findOneAndUpdate(
      { userId: session.userId, date: data.date },
      {
        $push: {
          meals: {
            clientId,
            name: data.name,
            servingAmount: data.servingAmount,
            nutrition: data.nutrition,
            mealType: data.mealType,
            recipeId: data.recipeId,
            notes: data.notes,
          },
        },
        $setOnInsert: { userId: session.userId, date: data.date },
      },
      { upsert: true, new: true }
    );

    return jsonOk(
      {
        data: {
          id: clientId,
          ...data,
        },
        entryId: entry._id.toString(),
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const meals = z.array(mealEntrySchema.extend({ id: z.string() })).parse(
      body.meals ?? body
    );

    await DailyEntry.deleteMany({ userId: session.userId });

    const byDate = new Map<string, typeof meals>();
    for (const meal of meals) {
      const list = byDate.get(meal.date) || [];
      list.push(meal);
      byDate.set(meal.date, list);
    }

    if (byDate.size > 0) {
      await DailyEntry.insertMany(
        Array.from(byDate.entries()).map(([date, dayMeals]) => ({
          userId: session.userId,
          date,
          meals: dayMeals.map((m) => ({
            clientId: m.id,
            name: m.name,
            servingAmount: m.servingAmount,
            nutrition: m.nutrition,
            mealType: m.mealType,
            recipeId: m.recipeId,
            notes: m.notes,
          })),
        }))
      );
    }

    const entries = await DailyEntry.find({ userId: session.userId });
    return jsonOk({ data: flattenDailyEntries(entries) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const id = String(body.id || "");
    if (!id) return jsonError("id is required", 400);

    const updates = mealEntrySchema.partial().parse(body);

    const entry = await DailyEntry.findOne({
      userId: session.userId,
      "meals.clientId": id,
    });
    if (!entry) return jsonError("Meal not found", 404);

    const meal = entry.meals.find((m) => m.clientId === id);
    if (!meal) return jsonError("Meal not found", 404);

    if (updates.date && updates.date !== entry.date) {
      await DailyEntry.updateOne(
        { _id: entry._id },
        { $pull: { meals: { clientId: id } } }
      );

      const moved = {
        clientId: id,
        name: updates.name ?? meal.name,
        servingAmount: updates.servingAmount ?? meal.servingAmount,
        nutrition: updates.nutrition ?? meal.nutrition,
        mealType: updates.mealType ?? meal.mealType,
        recipeId: updates.recipeId ?? meal.recipeId,
        notes: updates.notes ?? meal.notes,
      };

      await DailyEntry.findOneAndUpdate(
        { userId: session.userId, date: updates.date },
        {
          $push: { meals: moved },
          $setOnInsert: { userId: session.userId, date: updates.date },
        },
        { upsert: true }
      );
    } else {
      const mealIndex = entry.meals.findIndex((m) => m.clientId === id);
      if (mealIndex < 0) return jsonError("Meal not found", 404);
      const current = entry.meals[mealIndex];
      await DailyEntry.updateOne(
        { _id: entry._id, "meals.clientId": id },
        {
          $set: {
            "meals.$.name": updates.name ?? current.name,
            "meals.$.servingAmount":
              updates.servingAmount ?? current.servingAmount,
            "meals.$.nutrition": updates.nutrition ?? current.nutrition,
            "meals.$.mealType": updates.mealType ?? current.mealType,
            "meals.$.recipeId": updates.recipeId ?? current.recipeId,
            "meals.$.notes": updates.notes ?? current.notes,
          },
        }
      );
    }

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const id = request.nextUrl.searchParams.get("id");
    const date = request.nextUrl.searchParams.get("date");

    if (date && !id) {
      await DailyEntry.deleteOne({ userId: session.userId, date });
      return jsonOk({ success: true });
    }

    if (!id) return jsonError("id is required", 400);

    const result = await DailyEntry.updateOne(
      { userId: session.userId, "meals.clientId": id },
      { $pull: { meals: { clientId: id } } }
    );

    if (result.modifiedCount === 0) return jsonError("Meal not found", 404);
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
