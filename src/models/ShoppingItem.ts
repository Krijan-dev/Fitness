import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const shoppingItemSchema = new Schema(
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
    preferredBrand: String,
    preferredStore: String,
    notes: String,
    purchased: { type: Boolean, default: false },
    sourceRecipeIds: [String],
  },
  { timestamps: true }
);

export type ShoppingItemDocument = InferSchemaType<typeof shoppingItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ShoppingItem: Model<ShoppingItemDocument> =
  mongoose.models.ShoppingItem ||
  mongoose.model<ShoppingItemDocument>("ShoppingItem", shoppingItemSchema);
