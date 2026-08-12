import {
  firstImageFromPayload,
  resolveProductImageUrl,
  woolworthsCdnImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "@/services/grocery/image-urls";
import { detectChain, buildStoreId } from "@/services/grocery/places-utils";

describe("places utils", () => {
  it("detects supermarket chains", () => {
    expect(detectChain("Woolworths Metro")).toBe("woolworths");
    expect(detectChain("Coles Express")).toBe("coles");
    expect(detectChain("ALDI Canberra")).toBe("aldi");
    expect(detectChain("IGA Plus")).toBe("iga");
  });

  it("builds store ids", () => {
    expect(buildStoreId("coles", "places/abc", "2600")).toBe("coles:abc");
  });
});

describe("image placeholders", () => {
  it("uses /images/placeholder.png", () => {
    expect(PRODUCT_IMAGE_PLACEHOLDER).toBe("/images/placeholder.png");
  });

  it("extracts and builds woolworths CDN urls", () => {
    expect(
      firstImageFromPayload({ mediumImage: "https://cdn0.woolworths.media/a.jpg" })
    ).toContain("woolworths.media");
    expect(woolworthsCdnImage("123")).toContain("123.jpg");
    expect(
      resolveProductImageUrl({ store: "woolworths", row: { stockcode: "99" } })
    ).toContain("99.jpg");
  });
});
