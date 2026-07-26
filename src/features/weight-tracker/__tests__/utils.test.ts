import type { WeightEntry } from "@/types/weight";
import {
  calculateBMI,
  calculateWeightStats,
  calculateMonthlyWeightChange,
} from "../utils";

const entries: WeightEntry[] = [
  { id: "1", date: "2026-01-01", weight: 84 },
  { id: "2", date: "2026-01-08", weight: 83 },
  { id: "3", date: "2026-01-15", weight: 82 },
  { id: "4", date: "2026-02-01", weight: 81 },
];

describe("weight-tracker utils", () => {
  it("calculates BMI from height and weight", () => {
    const bmi = calculateBMI(81, 178);
    expect(bmi).toBeCloseTo(25.6, 1);
  });

  it("calculates weight stats and progress", () => {
    const stats = calculateWeightStats(entries, 78, 178);
    expect(stats.currentWeight).toBe(81);
    expect(stats.startingWeight).toBe(84);
    expect(stats.totalChange).toBe(-3);
    expect(stats.bmi).not.toBeNull();
    expect(stats.progressPercent).toBeGreaterThan(0);
  });

  it("calculates monthly weight change", () => {
    const change = calculateMonthlyWeightChange(entries);
    expect(change).toBe(-3);
  });
});
