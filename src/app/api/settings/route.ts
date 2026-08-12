import { NextRequest } from "next/server";
import { UserSettings } from "@/models/UserSettings";
import { withAuth } from "@/lib/route-auth";
import { settingsSchema } from "@/lib/validations";
import { settingsToDb, toClientSettings } from "@/lib/mappers";
import { jsonOk, handleApiError } from "@/lib/api";
import type { UserSettings as UserSettingsType } from "@/types/settings";

/** Emerald Clean redesign — migrate old dark-default prefs once. */
const CURRENT_PREFERENCES_VERSION = 2;

async function migratePreferencesIfNeeded(
  doc: InstanceType<typeof UserSettings> | null
) {
  if (!doc) return doc;
  const version =
    typeof doc.preferencesVersion === "number" ? doc.preferencesVersion : 1;
  if (version >= CURRENT_PREFERENCES_VERSION) return doc;

  doc.theme = "light";
  doc.preferencesVersion = CURRENT_PREFERENCES_VERSION;
  await doc.save();
  return doc;
}

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(request);
    let doc = await UserSettings.findOne({ userId: session.userId });
    doc = await migratePreferencesIfNeeded(doc);
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
        $set: {
          ...settingsToDb(merged, priceSelections),
          preferencesVersion: CURRENT_PREFERENCES_VERSION,
        },
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
