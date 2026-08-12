import {
  extractAldiPricing,
  resolveAldiAssetImage,
  filterAldiProductsByQuery,
  mapAldiApifyItem,
} from "../aldi-mapper";
import type { GroceryProduct } from "@/types/grocery";

const sampleRow = {
  sku: "000000000000380281",
  name: "Premium Red Seedless Grapes 400g",
  brand_name: null,
  url_slug_text: "no-brand-premium-red-seedless-grapes-400g",
  selling_size: "0.4 kg",
  price: {
    amount: 849,
    amount_relevant: 849,
    amount_relevant_display: "$8.49",
    comparison: 2123,
    comparison_display: "$21.23 per 1 kg",
    was_price_display: "$9.99",
    savings_display: "Save $1.50",
    currency_code: "AUD",
  },
  assets: [
    {
      url: "https://dm.apac.cms.aldi.cx/is/image/aldiprodapac/product/jpg/scaleWidth/{width}/abc/{slug}",
    },
  ],
};

describe("ALDI Apify dataset mapping", () => {
  it("parses nested cents prices into dollars and unit rates", () => {
    const pricing = extractAldiPricing(sampleRow);
    expect(pricing.currentPrice).toBe(8.49);
    expect(pricing.regularPrice).toBe(9.99);
    expect(pricing.unitPrice).toBe(21.23);
    expect(pricing.unitLabel).toBe("$/kg");
    expect(pricing.savingsDisplay).toBe("Save $1.50");
  });

  it("resolves ALDI CMS asset URLs with width and slug placeholders", () => {
    expect(resolveAldiAssetImage(sampleRow)).toBe(
      "https://dm.apac.cms.aldi.cx/is/image/aldiprodapac/product/jpg/scaleWidth/400/abc/no-brand-premium-red-seedless-grapes-400g"
    );
  });

  it("maps a full dataset row to a GroceryProduct", () => {
    const product = mapAldiApifyItem(sampleRow);
    expect(product.store).toBe("aldi");
    expect(product.name).toContain("Grapes");
    expect(product.currentPrice).toBe(8.49);
    expect(product.isOnSpecial).toBe(true);
    expect(product.imageUrl).toContain("dm.apac.cms.aldi.cx");
    expect(product.productUrl).toContain("aldi.com.au/product/");
    expect(product.dataSource).toBe("cached");
  });
});

describe("ALDI catalogue local filter", () => {
  const catalogue: GroceryProduct[] = [
    {
      id: "aldi-1",
      name: "Full Cream Milk 2L",
      store: "aldi",
      currentPrice: 2.89,
      lastUpdated: new Date().toISOString(),
      dataSource: "cached",
    },
    {
      id: "aldi-2",
      name: "Free Range Eggs 12pk",
      store: "aldi",
      currentPrice: 4.49,
      lastUpdated: new Date().toISOString(),
      dataSource: "cached",
    },
    {
      id: "aldi-3",
      name: "Almond Milk Unsweetened 1L",
      brand: "Emporium",
      store: "aldi",
      currentPrice: 1.99,
      lastUpdated: new Date().toISOString(),
      dataSource: "cached",
    },
  ];

  it("matches products from stored catalogue without Apify", () => {
    const milk = filterAldiProductsByQuery(catalogue, "milk");
    expect(milk.map((p) => p.id)).toEqual(
      expect.arrayContaining(["aldi-1", "aldi-3"])
    );
    expect(milk.every((p) => p.dataSource === "cached")).toBe(true);
  });

  it("returns empty for unrelated queries", () => {
    expect(filterAldiProductsByQuery(catalogue, "xylophone")).toEqual([]);
  });
});
