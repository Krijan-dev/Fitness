import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const pantryItemSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: { type: String, index: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String, required: true },
    lowStockThreshold: Number,
    expiryDate: String,
    notes: String,
  },
  { timestamps: true }
);

export type PantryItemDocument = InferSchemaType<typeof pantryItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PantryItem: Model<PantryItemDocument> =
  mongoose.models.PantryItem ||
  mongoose.model<PantryItemDocument>("PantryItem", pantryItemSchema);
