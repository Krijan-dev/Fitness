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

const mealSchema = new Schema(
  {
    clientId: { type: String, required: true },
    name: { type: String, required: true },
    servingAmount: { type: Number, required: true },
    nutrition: { type: nutritionSchema, required: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snacks"],
      required: true,
    },
    recipeId: String,
    notes: String,
  },
  { _id: false }
);

const dailyEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true },
    meals: { type: [mealSchema], default: [] },
  },
  { timestamps: true }
);

dailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export type DailyEntryDocument = InferSchemaType<typeof dailyEntrySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DailyEntry: Model<DailyEntryDocument> =
  mongoose.models.DailyEntry ||
  mongoose.model<DailyEntryDocument>("DailyEntry", dailyEntrySchema);
