import {
  normalizeProductName,
  parseSizeString,
  convertUnit,
  nameSimilarity,
  isLikelySameProduct,
  computeComparableUnitPrice,
  nextWednesdayDate,
} from "@/services/grocery/normalizer";

describe("grocery normalizer", () => {
  it("normalizes case, punctuation, and filler words", () => {
    expect(normalizeProductName("Fresh Full-Cream Milk!!!")).toBe(
      "full cream milk"
    );
  });

  it("parses metric sizes and converts units", () => {
    expect(parseSizeString("500g")?.grams).toBe(500);
    expect(parseSizeString("1.5 kg")?.grams).toBe(1500);
    expect(parseSizeString("2L")?.ml).toBe(2000);
    expect(convertUnit(1, "kg", "g")).toBe(1000);
    expect(convertUnit(500, "ml", "l")).toBe(0.5);
  });

  it("fuzzy-matches equivalent product names", () => {
    expect(
      nameSimilarity("Coles Full Cream Milk 2L", "full cream milk 2 litre")
    ).toBeGreaterThan(0.4);
    expect(
      isLikelySameProduct("Woolworths Greek Yoghurt 1kg", "Greek Yoghurt 1 kg")
    ).toBe(true);
  });

  it("computes comparable unit prices", () => {
    const unit = computeComparableUnitPrice(4, "500g");
    expect(unit?.unitLabel).toBe("per 100g");
    expect(unit?.unitPrice).toBeCloseTo(0.8);
  });

  it("calculates the next Wednesday refresh date", () => {
    // Fixed Sunday
    const from = new Date("2026-08-02T12:00:00");
    const next = nextWednesdayDate(from);
    expect(next.getDay()).toBe(3);
    expect(next.getDate()).toBe(5);
  });
});
