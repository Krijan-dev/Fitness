import { weightProgressPercent } from "../DailyTargetsSummary";

describe("weightProgressPercent", () => {
  it("tracks loss from start toward a lower target", () => {
    expect(weightProgressPercent(80, 78, 75)).toBeCloseTo(40);
  });

  it("tracks gain from start toward a higher target", () => {
    expect(weightProgressPercent(70, 72, 75)).toBeCloseTo(40);
  });

  it("is 100% at the target", () => {
    expect(weightProgressPercent(80, 75, 75)).toBe(100);
  });
});
