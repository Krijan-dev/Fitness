import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const weightEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: { type: String, index: true },
    date: { type: String, required: true },
    weight: { type: Number, required: true },
    waistMeasurement: Number,
    notes: String,
  },
  { timestamps: true }
);

export type WeightEntryDocument = InferSchemaType<typeof weightEntrySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WeightEntry: Model<WeightEntryDocument> =
  mongoose.models.WeightEntry ||
  mongoose.model<WeightEntryDocument>("WeightEntry", weightEntrySchema);
