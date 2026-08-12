import type { GroceryProduct } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { getApifyToken, getApifyDatasetId } from "../credentials";
import { mockGroceryProvider } from "./mock-grocery.provider";
import {
  findAldiByBarcode,
  isAldiCatalogueConfigured,
  searchAldiCatalogue,
} from "../aldi-catalogue.service";
import {
  extractAldiPricing,
  filterAldiProductsByQuery,
  mapAldiApifyItem,
  resolveAldiAssetImage,
} from "../aldi-mapper";

/**
 * ALDI Australia provider.
 *
 * Searches ONLY the stored Mongo catalogue (filled weekly from Apify).
 * Never runs Apify Actors or re-downloads the dataset on each search —
 * that was burning credits. Sync happens via:
 * - Weekly Wednesday refresh (`syncAldiCatalogueFromApify`)
 * - Admin grocery refresh
 * - One-time ensure when the catalogue is empty
 *
 * Configure: APIFY_API_TOKEN + APIFY_DATASET_ID (preferred), or ALDI_CACHE_URL.
 */
export class AldiApifyProvider implements GroceryProvider {
  readonly id = "aldi-apify";
  readonly displayName = "ALDI (cached catalogue)";
  readonly official = false;

  isConfigured(): boolean {
    return (
      isAldiCatalogueConfigured() ||
      Boolean(getApifyToken() || getApifyDatasetId())
    );
  }

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const cached = await searchAldiCatalogue(q);
      if (cached.length > 0) return cached;
    } catch (err) {
      console.error("ALDI catalogue search failed:", err);
    }

    // No Apify live runs here — mock only when catalogue has no match
    return (await mockGroceryProvider.searchProducts(q)).filter(
      (p) => p.store === "aldi"
    );
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    try {
      const hit = await findAldiByBarcode(barcode);
      if (hit) return hit;
    } catch (err) {
      console.error("ALDI catalogue barcode lookup failed:", err);
    }

    const results = await this.searchProducts(barcode);
    return (
      results.find(
        (p) => p.barcode === barcode.trim() || p.id.includes(barcode.trim())
      ) ?? null
    );
  }

  mapItem(row: Record<string, unknown>): GroceryProduct {
    return mapAldiApifyItem(row, this.id);
  }
}

export {
  extractAldiPricing,
  filterAldiProductsByQuery,
  mapAldiApifyItem,
  resolveAldiAssetImage,
};

export const aldiApifyProvider = new AldiApifyProvider();
