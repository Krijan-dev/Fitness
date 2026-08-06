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

const ingredientSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    caloriesPer100g: { type: Number, required: true },
    proteinPer100g: { type: Number, required: true },
    carbsPer100g: { type: Number, required: true },
    fatPer100g: { type: Number, required: true },
    fibrePer100g: Number,
    sugarPer100g: Number,
    sodiumPer100g: Number,
    category: String,
    brand: String,
    storeProductId: String,
    notes: String,
    gramEquivalent: Number,
  },
  { _id: false }
);

const recipeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: { type: String, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    ingredients: { type: [ingredientSchema], default: [] },
    nutrition: { type: nutritionSchema, required: true },
    cookedWeight: Number,
    servingSize: { type: Number, required: true },
    servings: { type: Number, required: true },
    prepTimeMinutes: Number,
    cookTimeMinutes: Number,
    notes: String,
    favourite: { type: Boolean, default: false },
    imageUrl: String,
  },
  { timestamps: true }
);

recipeSchema.index({ userId: 1, clientId: 1 });

export type RecipeDocument = InferSchemaType<typeof recipeSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Recipe: Model<RecipeDocument> =
  mongoose.models.Recipe ||
  mongoose.model<RecipeDocument>("Recipe", recipeSchema);
