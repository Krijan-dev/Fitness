import type { Availability, DataSource, StoreName } from "./common";

export type GroceryStoreId = StoreName | "open-food-facts" | "unknown";

export interface GroceryProduct {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  store: GroceryStoreId;
  currentPrice?: number;
  regularPrice?: number;
  unitPrice?: number;
  unitLabel?: string;
  size?: string;
  imageUrl?: string;
  productUrl?: string;
  isOnSpecial?: boolean;
  discountPercentage?: number;
  availability?: Availability;
  catalogueExpiresAt?: string;
  lastUpdated: string;
  dataSource: DataSource;
  normalizedName?: string;
  /** Canonical mass in grams when parseable */
  quantityGrams?: number;
  /** Canonical volume in millilitres when parseable */
  quantityMl?: number;
  providerId?: string;
  raw?: Record<string, unknown>;
}

export interface NearbyStore {
  id: string;
  name: string;
  chain: "coles" | "woolworths" | "aldi" | "other";
  address: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  placeId?: string;
  openNow?: boolean;
}

export interface GrocerySyncStatus {
  lastSyncedAt: string | null;
  nextWednesdayRefreshAt: string;
  providers: {
    name: string;
    status: "ok" | "skipped" | "error";
    message?: string;
    productCount?: number;
  }[];
}
