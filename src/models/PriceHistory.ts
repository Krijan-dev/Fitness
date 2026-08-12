import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const priceHistorySchema = new Schema(
  {
    groceryProductId: {
      type: Schema.Types.ObjectId,
      ref: "GroceryProduct",
      required: true,
      index: true,
    },
    store: { type: String, required: true, index: true },
    externalId: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    regularPrice: Number,
    unitPrice: Number,
    isOnSpecial: Boolean,
    capturedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

priceHistorySchema.index({ store: 1, externalId: 1, capturedAt: -1 });

export type PriceHistoryDocument = InferSchemaType<typeof priceHistorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PriceHistoryModel: Model<PriceHistoryDocument> =
  mongoose.models.PriceHistory ||
  mongoose.model<PriceHistoryDocument>("PriceHistory", priceHistorySchema);
