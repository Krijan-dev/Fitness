import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const nutritionSchema = new Schema(
  {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fibre: Number,
    sugar: Number,
    sodium: Number,
  },
  { _id: false }
);

const plannedMealSchema = new Schema(
  {
    id: { type: String, required: true },
    recipeId: { type: String, required: true },
    recipeName: { type: String, required: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snacks"],
      required: true,
    },
    day: { type: String, required: true },
    servings: { type: Number, required: true },
    nutrition: { type: nutritionSchema, required: true },
  },
  { _id: false }
);

const mealPlanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weekStart: { type: String, required: true },
    clientId: { type: String },
    days: { type: [plannedMealSchema], default: [] },
  },
  { timestamps: true }
);

mealPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export type MealPlanDocument = InferSchemaType<typeof mealPlanSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MealPlan: Model<MealPlanDocument> =
  mongoose.models.MealPlan ||
  mongoose.model<MealPlanDocument>("MealPlan", mealPlanSchema);
