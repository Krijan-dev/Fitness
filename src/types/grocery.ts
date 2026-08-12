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
  /** Supermarket stockcode / SKU used for CDN image fallbacks */
  stockCode?: string;
  /** Location-specific store identifier when known */
  storeId?: string;
  providerId?: string;
  raw?: Record<string, unknown>;
}

export type NearbyStoreChain =
  | "coles"
  | "woolworths"
  | "aldi"
  | "iga"
  | "other";

export interface NearbyStore {
  id: string;
  name: string;
  chain: NearbyStoreChain;
  /** Stable chain store id derived from Places id / stock feed when available */
  storeId?: string;
  address: string;
  postcode?: string;
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
