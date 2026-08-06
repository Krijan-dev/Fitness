import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSettingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    calorieGoal: { type: Number, default: 2200 },
    proteinGoal: { type: Number, default: 150 },
    carbGoal: { type: Number, default: 250 },
    fatGoal: { type: Number, default: 70 },
    theme: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "dark",
    },
    units: {
      type: String,
      enum: ["metric", "imperial"],
      default: "metric",
    },
    location: {
      country: { type: String, default: "Australia" },
      state: { type: String, default: "ACT" },
      city: { type: String, default: "Canberra" },
      postcode: { type: String, default: "2600" },
    },
    profile: {
      displayName: String,
      heightCm: Number,
      currentWeightKg: Number,
      targetWeightKg: Number,
    },
    priceSelections: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

export type UserSettingsDocument = InferSchemaType<typeof userSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserSettings: Model<UserSettingsDocument> =
  mongoose.models.UserSettings ||
  mongoose.model<UserSettingsDocument>("UserSettings", userSettingsSchema);
