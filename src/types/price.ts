import type { Availability, DataSource, StoreName } from "./common";

export interface StoreProductPrice {
  id: string;
  query: string;
  productName: string;
  brand?: string;
  size?: string;
  store: StoreName;
  currentPrice: number;
  regularPrice?: number;
  unitPrice?: number;
  unitLabel?: string;
  isOnSpecial: boolean;
  discountPercentage?: number;
  availability?: Availability;
  productUrl?: string;
  imageUrl?: string;
  location?: string;
  dataSource: DataSource;
  lastUpdated: string;
}
