import type { Recipe } from "@/types/recipe";
import type { MealEntry, PlannedMeal, WeeklyMealPlan } from "@/types/meal";
import type { ShoppingItem } from "@/types/shopping";
import type { PantryItem } from "@/types/pantry";
import type { WeightEntry } from "@/types/weight";
import type { UserSettings } from "@/types/settings";
import type { RecipeDocument } from "@/models/Recipe";
import type { DailyEntryDocument } from "@/models/DailyEntry";
import type { MealPlanDocument } from "@/models/MealPlan";
import type { ShoppingItemDocument } from "@/models/ShoppingItem";
import type { PantryItemDocument } from "@/models/PantryItem";
import type { WeightEntryDocument } from "@/models/WeightEntry";
import type { UserSettingsDocument } from "@/models/UserSettings";
import type { RecipeCategory, ShoppingCategory, ThemeMode, UnitSystem } from "@/types/common";

export function toClientRecipe(doc: RecipeDocument): Recipe {
  return {
    id: doc.clientId || doc._id.toString(),
    name: doc.title,
    category: doc.category as RecipeCategory,
    description: doc.description || undefined,
    cuisine: doc.cuisine || undefined,
    difficulty: (doc.difficulty as Recipe["difficulty"]) || undefined,
    ingredients: (doc.ingredients || []) as Recipe["ingredients"],
    instructions: doc.instructions || undefined,
    totalNutrition: doc.nutrition as Recipe["totalNutrition"],
    cookedWeight: doc.cookedWeight ?? undefined,
    servingSize: doc.servingSize,
    servings: doc.servings,
    prepTimeMinutes: doc.prepTimeMinutes ?? undefined,
    cookTimeMinutes: doc.cookTimeMinutes ?? undefined,
    notes: doc.notes || undefined,
    isFavourite: Boolean(doc.favourite),
    imageUrl: doc.imageUrl || undefined,
    ownerType: (doc.ownerType as Recipe["ownerType"]) || "user",
    visibility: (doc.visibility as Recipe["visibility"]) || "private",
    status: (doc.status as Recipe["status"]) || "published",
    createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function flattenDailyEntries(entries: DailyEntryDocument[]): MealEntry[] {
  const meals: MealEntry[] = [];
  for (const entry of entries) {
    for (const meal of entry.meals || []) {
      meals.push({
        id: meal.clientId,
        name: meal.name,
        servingAmount: meal.servingAmount,
        nutrition: meal.nutrition as MealEntry["nutrition"],
        mealType: meal.mealType as MealEntry["mealType"],
        date: entry.date,
        recipeId: meal.recipeId || undefined,
        notes: meal.notes || undefined,
      });
    }
  }
  return meals;
}

export function toClientMealPlan(doc: MealPlanDocument | null): WeeklyMealPlan | null {
  if (!doc) return null;
  return {
    id: doc.clientId || doc._id.toString(),
    weekStart: doc.weekStart,
    meals: (doc.days || []) as PlannedMeal[],
  };
}

export function toClientShoppingItem(doc: ShoppingItemDocument): ShoppingItem {
  return {
    id: doc.clientId || doc._id.toString(),
    name: doc.name,
    quantity: doc.quantity,
    unit: doc.unit,
    category: doc.category as ShoppingCategory,
    preferredBrand: doc.preferredBrand || undefined,
    preferredStore: doc.preferredStore || undefined,
    notes: doc.notes || undefined,
    purchased: Boolean(doc.purchased),
    sourceRecipeIds: doc.sourceRecipeIds || undefined,
  };
}

export function toClientPantryItem(doc: PantryItemDocument): PantryItem {
  return {
    id: doc.clientId || doc._id.toString(),
    name: doc.name,
    quantity: doc.quantity,
    unit: doc.unit,
    category: doc.category,
    lowStockThreshold: doc.lowStockThreshold ?? undefined,
    expiryDate: doc.expiryDate || undefined,
    notes: doc.notes || undefined,
  };
}

export function toClientWeightEntry(doc: WeightEntryDocument): WeightEntry {
  return {
    id: doc.clientId || doc._id.toString(),
    date: doc.date,
    weight: doc.weight,
    waistMeasurement: doc.waistMeasurement ?? undefined,
    notes: doc.notes || undefined,
  };
}

export function toClientSettings(doc: UserSettingsDocument | null): UserSettings {
  const defaults: UserSettings = {
    profile: {
      displayName: "User",
      heightCm: 178,
      currentWeightKg: 81.2,
      targetWeightKg: 78,
    },
    nutritionGoals: {
      dailyCalorieGoal: 2200,
      dailyProteinGoal: 150,
      dailyCarbGoal: 250,
      dailyFatGoal: 70,
    },
    units: "metric",
    location: {
      country: "Australia",
      state: "ACT",
      city: "Canberra",
      postcode: "2600",
    },
    theme: "dark",
  };

  if (!doc) return defaults;

  const priceSelections: Record<string, string> = {};
  if (doc.priceSelections) {
    const map = doc.priceSelections as unknown as Map<string, string> | Record<string, string>;
    if (map instanceof Map) {
      map.forEach((value, key) => {
        priceSelections[key] = value;
      });
    } else {
      Object.assign(priceSelections, map);
    }
  }

  return {
    profile: {
      displayName: doc.profile?.displayName ?? defaults.profile.displayName,
      heightCm: doc.profile?.heightCm ?? defaults.profile.heightCm,
      currentWeightKg:
        doc.profile?.currentWeightKg ?? defaults.profile.currentWeightKg,
      targetWeightKg:
        doc.profile?.targetWeightKg ?? defaults.profile.targetWeightKg,
    },
    nutritionGoals: {
      dailyCalorieGoal: doc.calorieGoal ?? defaults.nutritionGoals.dailyCalorieGoal,
      dailyProteinGoal: doc.proteinGoal ?? defaults.nutritionGoals.dailyProteinGoal,
      dailyCarbGoal: doc.carbGoal ?? defaults.nutritionGoals.dailyCarbGoal,
      dailyFatGoal: doc.fatGoal ?? defaults.nutritionGoals.dailyFatGoal,
    },
    units: (doc.units as UnitSystem) || defaults.units,
    location: {
      country: doc.location?.country || defaults.location.country,
      state: doc.location?.state || defaults.location.state,
      city: doc.location?.city || defaults.location.city,
      postcode: doc.location?.postcode || defaults.location.postcode,
    },
    theme: (doc.theme as ThemeMode) || defaults.theme,
    // priceSelections are synced separately via settings API
    ...(Object.keys(priceSelections).length
      ? ({ priceSelections } as unknown as object)
      : {}),
  } as UserSettings & { priceSelections?: Record<string, string> };
}

export function settingsToDb(settings: UserSettings, priceSelections?: Record<string, string>) {
  return {
    calorieGoal: settings.nutritionGoals.dailyCalorieGoal,
    proteinGoal: settings.nutritionGoals.dailyProteinGoal,
    carbGoal: settings.nutritionGoals.dailyCarbGoal,
    fatGoal: settings.nutritionGoals.dailyFatGoal,
    theme: settings.theme,
    units: settings.units,
    location: settings.location,
    profile: settings.profile,
    ...(priceSelections ? { priceSelections } : {}),
  };
}
