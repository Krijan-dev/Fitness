import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { User } from "@/models/User";
import { Recipe } from "@/models/Recipe";
import { DailyEntry } from "@/models/DailyEntry";
import { MealPlan } from "@/models/MealPlan";
import { ShoppingItem } from "@/models/ShoppingItem";
import { PantryItem } from "@/models/PantryItem";
import { WeightEntry } from "@/models/WeightEntry";
import { UserSettings } from "@/models/UserSettings";
import { withAdmin } from "@/lib/route-auth";
import {
  adminDisableSchema,
  adminResetPasswordSchema,
  adminRoleSchema,
} from "@/lib/validations";
import { hashPassword } from "@/lib/auth";
import { flattenDailyEntries, toClientMealPlan, toClientPantryItem, toClientRecipe, toClientSettings, toClientShoppingItem, toClientWeightEntry } from "@/lib/mappers";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";

function isObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await withAdmin(request);
    const { id } = await context.params;
    if (!isObjectId(id)) return jsonError("Invalid user id", 400);

    const user = await User.findById(id).select(
      "name email role createdAt lastActivityAt disabled"
    );
    if (!user) return jsonError("User not found", 404);

    const [
      recipes,
      dailyEntries,
      mealPlans,
      shopping,
      pantry,
      weights,
      settings,
    ] = await Promise.all([
      Recipe.find({ userId: id }),
      DailyEntry.find({ userId: id }),
      MealPlan.find({ userId: id }),
      ShoppingItem.find({ userId: id }),
      PantryItem.find({ userId: id }),
      WeightEntry.find({ userId: id }),
      UserSettings.findOne({ userId: id }),
    ]);

    return jsonOk({
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt?.toISOString?.() ?? null,
          lastActivityAt: user.lastActivityAt?.toISOString?.() ?? null,
          disabled: Boolean(user.disabled),
        },
        recipes: recipes.map(toClientRecipe),
        meals: flattenDailyEntries(dailyEntries),
        mealPlans: mealPlans.map((p) => toClientMealPlan(p)),
        shopping: shopping.map(toClientShoppingItem),
        pantry: pantry.map(toClientPantryItem),
        weights: weights.map(toClientWeightEntry),
        settings: toClientSettings(settings),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await withAdmin(request);
    const { id } = await context.params;
    if (!isObjectId(id)) return jsonError("Invalid user id", 400);

    const body = await request.json();
    const action = String(body.action || "");

    const user = await User.findById(id).select("+passwordHash");
    if (!user) return jsonError("User not found", 404);

    if (action === "role") {
      const { role } = adminRoleSchema.parse(body);
      if (user._id.toString() === admin.userId && role !== "admin") {
        return jsonError("Cannot demote your own admin account", 400);
      }
      user.role = role;
      await user.save();
    } else if (action === "reset-password") {
      const { password } = adminResetPasswordSchema.parse(body);
      user.passwordHash = await hashPassword(password);
      await user.save();
    } else if (action === "disable") {
      const { disabled } = adminDisableSchema.parse(body);
      if (user._id.toString() === admin.userId && disabled) {
        return jsonError("Cannot disable your own account", 400);
      }
      user.disabled = disabled;
      await user.save();
    } else {
      return jsonError("Unknown action", 400);
    }

    return jsonOk({
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        disabled: Boolean(user.disabled),
        createdAt: user.createdAt?.toISOString?.() ?? null,
        lastActivityAt: user.lastActivityAt?.toISOString?.() ?? null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await withAdmin(request);
    const { id } = await context.params;
    if (!isObjectId(id)) return jsonError("Invalid user id", 400);
    if (id === admin.userId) {
      return jsonError("Cannot delete your own account", 400);
    }

    const user = await User.findById(id);
    if (!user) return jsonError("User not found", 404);

    await Promise.all([
      Recipe.deleteMany({ userId: id }),
      DailyEntry.deleteMany({ userId: id }),
      MealPlan.deleteMany({ userId: id }),
      ShoppingItem.deleteMany({ userId: id }),
      PantryItem.deleteMany({ userId: id }),
      WeightEntry.deleteMany({ userId: id }),
      UserSettings.deleteMany({ userId: id }),
      User.deleteOne({ _id: id }),
    ]);

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
