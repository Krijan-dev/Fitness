import { toClientSettings } from "@/lib/mappers";
import { encryptNumber, resetEncryptionKeyCache } from "@/lib/crypto";
import type { UserSettingsDocument } from "@/models/UserSettings";

describe("toClientSettings decrypts metrics for the dashboard", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    resetEncryptionKeyCache();
  });

  it("returns plaintext numbers from encrypted envelopes", () => {
    const settings = toClientSettings({
      calorieGoal: 2000,
      proteinGoal: 140,
      carbGoal: 200,
      fatGoal: 60,
      theme: "light",
      units: "metric",
      location: {
        country: "Australia",
        state: "ACT",
        city: "Canberra",
        postcode: "2600",
      },
      profile: {
        displayName: "Sam",
        heightCm: encryptNumber(170),
        currentWeightKg: encryptNumber(70),
        targetWeightKg: encryptNumber(65),
        age: encryptNumber(30),
        onboardingCompleted: true,
      },
    } as unknown as UserSettingsDocument);

    expect(settings.profile.heightCm).toBe(170);
    expect(settings.profile.currentWeightKg).toBe(70);
    expect(settings.profile.targetWeightKg).toBe(65);
    expect(settings.profile.age).toBe(30);
  });
});
