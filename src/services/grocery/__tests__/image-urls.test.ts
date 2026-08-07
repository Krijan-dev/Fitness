import {
  firstImageFromPayload,
  resolveProductImageUrl,
  woolworthsCdnImage,
  colesCdnImage,
  openFoodFactsBarcodeImage,
} from "@/services/grocery/image-urls";
import { compareByUnitThenShelfPrice } from "@/features/price-comparison/sort-prices";
import type { StoreProductPrice } from "@/types/price";

describe("grocery image URL extraction", () => {
  it("reads common image fields from payloads", () => {
    expect(
      firstImageFromPayload({ mediumImage: "https://cdn.example/a.jpg" })
    ).toBe("https://cdn.example/a.jpg");
    expect(
      firstImageFromPayload({ thumbnail: "//cdn.example/b.jpg" })
    ).toBe("https://cdn.example/b.jpg");
  });

  it("builds Woolworths / Coles / OFF CDN fallbacks", () => {
    expect(woolworthsCdnImage("123456")).toContain(
      "cdn0.woolworths.media/content/wowproductimages/medium/123456.jpg"
    );
    expect(colesCdnImage("1234567")).toContain(
      "cdn.productimages.coles.com.au/productimages/"
    );
    expect(openFoodFactsBarcodeImage("9300675001234")).toContain(
      "images.openfoodfacts.org/images/products/"
    );
  });

  it("resolves store-specific fallbacks when payload has no image", () => {
    expect(
      resolveProductImageUrl({
        store: "woolworths",
        row: { stockcode: "555" },
      })
    ).toContain("555.jpg");
    expect(
      resolveProductImageUrl({
        store: "open-food-facts",
        row: {},
        barcode: "9300675001234",
      })
    ).toContain("openfoodfacts");
  });
});

describe("unit price sort", () => {
  it("sorts by unit price before shelf price", () => {
    const a = {
      id: "a",
      currentPrice: 10,
      unitPrice: 2,
    } as StoreProductPrice;
    const b = {
      id: "b",
      currentPrice: 5,
      unitPrice: 3,
    } as StoreProductPrice;
    expect([b, a].sort(compareByUnitThenShelfPrice).map((p) => p.id)).toEqual([
      "a",
      "b",
    ]);
  });
});
