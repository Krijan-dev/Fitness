import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    email: z.string().trim().email("Valid email is required").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
});

export const nutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fibre: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
});

export const ingredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  caloriesPer100g: z.number(),
  proteinPer100g: z.number(),
  carbsPer100g: z.number(),
  fatPer100g: z.number(),
  fibrePer100g: z.number().optional(),
  sugarPer100g: z.number().optional(),
  sodiumPer100g: z.number().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  storeProductId: z.string().optional(),
  notes: z.string().optional(),
  gramEquivalent: z.number().optional(),
});

export const recipeCreateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  ingredients: z.array(ingredientSchema).default([]),
  totalNutrition: nutritionSchema,
  cookedWeight: z.number().optional(),
  servingSize: z.number(),
  servings: z.number(),
  prepTimeMinutes: z.number().optional(),
  cookTimeMinutes: z.number().optional(),
  notes: z.string().optional(),
  isFavourite: z.boolean().optional().default(false),
  imageUrl: z.string().optional(),
});

export const recipeUpdateSchema = recipeCreateSchema.partial();

export const mealEntrySchema = z.object({
  name: z.string().min(1),
  servingAmount: z.number(),
  nutrition: nutritionSchema,
  mealType: z.enum(["breakfast", "lunch", "dinner", "snacks"]),
  date: z.string().min(1),
  recipeId: z.string().optional(),
  notes: z.string().optional(),
});

export const plannedMealSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  recipeName: z.string(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snacks"]),
  day: z.string(),
  servings: z.number(),
  nutrition: nutritionSchema,
});

export const mealPlanSchema = z.object({
  weekStart: z.string().min(1),
  meals: z.array(plannedMealSchema),
  clientId: z.string().optional(),
});

export const shoppingItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number(),
  unit: z.string(),
  category: z.string(),
  preferredBrand: z.string().optional(),
  preferredStore: z.string().optional(),
  notes: z.string().optional(),
  purchased: z.boolean().optional().default(false),
  sourceRecipeIds: z.array(z.string()).optional(),
});

export const pantryItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number(),
  unit: z.string(),
  category: z.string(),
  lowStockThreshold: z.number().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

export const weightEntrySchema = z.object({
  date: z.string().min(1),
  weight: z.number(),
  waistMeasurement: z.number().optional(),
  notes: z.string().optional(),
});

export const settingsSchema = z.object({
  profile: z
    .object({
      displayName: z.string().optional(),
      heightCm: z.number().optional(),
      currentWeightKg: z.number().optional(),
      targetWeightKg: z.number().optional(),
    })
    .optional(),
  nutritionGoals: z
    .object({
      dailyCalorieGoal: z.number(),
      dailyProteinGoal: z.number(),
      dailyCarbGoal: z.number(),
      dailyFatGoal: z.number(),
    })
    .optional(),
  units: z.enum(["metric", "imperial"]).optional(),
  location: z
    .object({
      country: z.string(),
      state: z.string(),
      city: z.string(),
      postcode: z.string().optional(),
    })
    .optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
  priceSelections: z.record(z.string(), z.string()).optional(),
});

export const adminRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const adminResetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

export const adminDisableSchema = z.object({
  disabled: z.boolean(),
});
