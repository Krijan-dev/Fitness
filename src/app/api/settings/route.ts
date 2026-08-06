import { NextRequest } from "next/server";
import { UserSettings } from "@/models/UserSettings";
import { withAuth } from "@/lib/route-auth";
import { settingsSchema } from "@/lib/validations";
import { settingsToDb, toClientSettings } from "@/lib/mappers";
import { jsonOk, handleApiError } from "@/lib/api";
import type { UserSettings as UserSettingsType } from "@/types/settings";

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const doc = await UserSettings.findOne({ userId: session.userId });
    const settings = toClientSettings(doc);
    const priceSelections =
      (settings as UserSettingsType & { priceSelections?: Record<string, string> })
        .priceSelections || {};

    return jsonOk({
      data: {
        settings: {
          profile: settings.profile,
          nutritionGoals: settings.nutritionGoals,
          units: settings.units,
          location: settings.location,
          theme: settings.theme,
        },
        priceSelections,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const parsed = settingsSchema.parse(body.settings ?? body);

    const existing = await UserSettings.findOne({ userId: session.userId });
    const current = toClientSettings(existing);

    const merged: UserSettingsType = {
      profile: { ...current.profile, ...parsed.profile },
      nutritionGoals: {
        ...current.nutritionGoals,
        ...parsed.nutritionGoals,
      },
      units: parsed.units ?? current.units,
      location: { ...current.location, ...parsed.location },
      theme: parsed.theme ?? current.theme,
    };

    const priceSelections =
      parsed.priceSelections ??
      (body.priceSelections as Record<string, string> | undefined);

    const doc = await UserSettings.findOneAndUpdate(
      { userId: session.userId },
      {
        $set: settingsToDb(merged, priceSelections),
        $setOnInsert: { userId: session.userId },
      },
      { upsert: true, new: true }
    );

    const settings = toClientSettings(doc);
    return jsonOk({
      data: {
        settings: {
          profile: settings.profile,
          nutritionGoals: settings.nutritionGoals,
          units: settings.units,
          location: settings.location,
          theme: settings.theme,
        },
        priceSelections:
          (settings as UserSettingsType & {
            priceSelections?: Record<string, string>;
          }).priceSelections ||
          priceSelections ||
          {},
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
