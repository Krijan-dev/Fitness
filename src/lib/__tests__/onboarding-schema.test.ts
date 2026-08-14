import { onboardingSchema } from "../onboarding-schema";

describe("onboardingSchema", () => {
  const valid = {
    age: 28,
    gender: "female",
    heightCm: 165,
    currentWeightKg: 65,
    targetWeightKg: 62,
    goal: "weight-loss",
    activityLevel: "lightly-active",
  };

  it("accepts a complete profile", () => {
    expect(onboardingSchema.safeParse(valid).success).toBe(true);
  });

  it("coerces numeric strings from form inputs", () => {
    const result = onboardingSchema.safeParse({
      ...valid,
      age: "28",
      heightCm: "165.5",
      currentWeightKg: "65",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.age).toBe(28);
      expect(result.data.heightCm).toBe(165.5);
    }
  });

  it("rejects missing gender", () => {
    expect(
      onboardingSchema.safeParse({
        age: 28,
        heightCm: 165,
        currentWeightKg: 65,
        targetWeightKg: 62,
        goal: "weight-loss",
        activityLevel: "lightly-active",
      }).success
    ).toBe(false);
  });

  it("rejects unrealistic height", () => {
    expect(
      onboardingSchema.safeParse({ ...valid, heightCm: 80 }).success
    ).toBe(false);
  });
});
