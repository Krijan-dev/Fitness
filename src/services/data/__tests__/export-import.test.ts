import { validateImportData, EXPORT_VERSION } from "../export-import.service";

const validExport = {
  version: EXPORT_VERSION,
  exportedAt: "2026-03-20T00:00:00.000Z",
  recipes: [],
  dailyMeals: [],
  mealPlan: { id: "p1", weekStart: "2026-03-17", meals: [] },
  shoppingList: [],
  pantry: [],
  weightEntries: [],
  settings: {
    profile: {},
    nutritionGoals: {
      dailyCalorieGoal: 2200,
      dailyProteinGoal: 150,
      dailyCarbGoal: 250,
      dailyFatGoal: 70,
    },
    units: "metric",
    location: { country: "Australia", state: "ACT", city: "Canberra" },
    theme: "dark",
  },
  priceSelections: {},
};

describe("export-import", () => {
  it("accepts valid export payloads", () => {
    expect(validateImportData(validExport)).not.toBeNull();
  });

  it("rejects invalid or incomplete payloads", () => {
    expect(validateImportData(null)).toBeNull();
    expect(validateImportData({ version: "bad" })).toBeNull();
    expect(validateImportData({ ...validExport, recipes: "not-array" })).toBeNull();
  });
});
