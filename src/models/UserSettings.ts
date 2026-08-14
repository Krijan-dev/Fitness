import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import {
  applyFieldEncryption,
  metricFieldAccessors,
} from "@/lib/encrypted-metrics";

const encryptedMetric = {
  type: Schema.Types.Mixed,
  ...metricFieldAccessors(),
};

const profileSchema = new Schema(
  {
    displayName: String,
    heightCm: { ...encryptedMetric },
    currentWeightKg: { ...encryptedMetric },
    targetWeightKg: { ...encryptedMetric },
    startingWeightKg: { ...encryptedMetric },
    age: { ...encryptedMetric },
    gender: { type: String, enum: ["male", "female"] },
    activityLevel: {
      type: String,
      enum: [
        "sedentary",
        "lightly-active",
        "moderately-active",
        "very-active",
      ],
    },
    goal: {
      type: String,
      enum: ["weight-loss", "maintain", "muscle-gain"],
    },
    onboardingCompleted: { type: Boolean, default: false },
    bmr: Number,
    tdee: Number,
  },
  {
    _id: false,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

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
      default: "light",
    },
    /** Bumped when product design defaults change (e.g. emerald light theme). */
    preferencesVersion: {
      type: Number,
      default: 2,
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
      type: profileSchema,
      default: {},
    },
    priceSelections: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

applyFieldEncryption(userSettingsSchema);

export type UserSettingsDocument = InferSchemaType<typeof userSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserSettings: Model<UserSettingsDocument> =
  mongoose.models.UserSettings ||
  mongoose.model<UserSettingsDocument>("UserSettings", userSettingsSchema);
