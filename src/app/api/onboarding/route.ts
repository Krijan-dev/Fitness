import { NextRequest } from "next/server";
import { withAuth } from "@/lib/route-auth";
import { handleApiError, jsonOk } from "@/lib/api";
import { onboardingSchema } from "@/lib/onboarding-schema";
import {
  getOnboardingCompleted,
  saveOnboardingProfile,
} from "@/services/onboarding/onboarding.service";
import { calculateNutritionTargets } from "@/services/nutrition/tdee.service";
import { UserSettings } from "@/models/UserSettings";
import { toClientSettings } from "@/lib/mappers";

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const completed = await getOnboardingCompleted(session.userId);
    const doc = await UserSettings.findOne({ userId: session.userId });
    const settings = toClientSettings(doc);
    return jsonOk({
      data: {
        completed,
        profile: settings.profile,
        nutritionGoals: settings.nutritionGoals,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const input = onboardingSchema.parse(body);
    const targets = calculateNutritionTargets(input);
    const settings = await saveOnboardingProfile(
      session.userId,
      input,
      session.name
    );

    return jsonOk({
      data: {
        settings,
        targets,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
