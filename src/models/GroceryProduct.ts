import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const groceryProductSchema = new Schema(
  {
    externalId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    normalizedName: { type: String, required: true, index: true },
    brand: String,
    barcode: { type: String, index: true },
    store: {
      type: String,
      required: true,
      index: true,
    },
    currentPrice: Number,
    regularPrice: Number,
    unitPrice: Number,
    unitLabel: String,
    size: String,
    imageUrl: String,
    productUrl: String,
    isOnSpecial: { type: Boolean, default: false },
    discountPercentage: Number,
    catalogueExpiresAt: Date,
    quantityGrams: Number,
    quantityMl: Number,
    dataSource: {
      type: String,
      enum: ["live-api", "cached", "mock", "manual"],
      default: "cached",
    },
    providerId: String,
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

groceryProductSchema.index({ store: 1, normalizedName: 1 });
groceryProductSchema.index({ store: 1, barcode: 1 });

export type GroceryProductDocument = InferSchemaType<typeof groceryProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GroceryProductModel: Model<GroceryProductDocument> =
  mongoose.models.GroceryProduct ||
  mongoose.model<GroceryProductDocument>("GroceryProduct", groceryProductSchema);
