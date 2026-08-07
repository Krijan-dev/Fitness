import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const providerResultSchema = new Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["ok", "skipped", "error"],
      required: true,
    },
    message: String,
    productCount: Number,
  },
  { _id: false }
);

const grocerySyncMetaSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    lastSyncedAt: Date,
    nextWednesdayRefreshAt: Date,
    lastRefreshTriggeredBy: String,
    providers: { type: [providerResultSchema], default: [] },
    seedQueries: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type GrocerySyncMetaDocument = InferSchemaType<
  typeof grocerySyncMetaSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const GrocerySyncMetaModel: Model<GrocerySyncMetaDocument> =
  mongoose.models.GrocerySyncMeta ||
  mongoose.model<GrocerySyncMetaDocument>(
    "GrocerySyncMeta",
    grocerySyncMetaSchema
  );
