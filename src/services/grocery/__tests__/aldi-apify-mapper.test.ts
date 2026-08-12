import {
  extractAldiPricing,
  resolveAldiAssetImage,
  AldiApifyProvider,
} from "../providers/aldi-apify.provider";

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
    const provider = new AldiApifyProvider();
    const product = provider.mapItem(sampleRow);
    expect(product.store).toBe("aldi");
    expect(product.name).toContain("Grapes");
    expect(product.currentPrice).toBe(8.49);
    expect(product.isOnSpecial).toBe(true);
    expect(product.imageUrl).toContain("dm.apac.cms.aldi.cx");
    expect(product.productUrl).toContain("aldi.com.au/product/");
  });
});
