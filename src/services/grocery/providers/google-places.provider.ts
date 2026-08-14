import type { GroceryProduct, NearbyStore } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";
import { getGoogleMapsApiKey } from "../credentials";
import {
  buildStoreId,
  detectChain,
  extractPostcode,
  haversineMeters,
} from "../places-utils";

export {
  buildStoreId,
  detectChain,
  extractPostcode,
  haversineMeters,
} from "../places-utils";

/**
 * Official Google Places API for supermarket locations.
 * Prefers classic Nearby Search (`type=supermarket`), then Places API (New).
 * Docs: https://developers.google.com/maps/documentation/places/web-service/search-nearby
 */
export class GooglePlacesProvider implements GroceryProvider {
  readonly id = "google-places";
  readonly displayName = "Google Maps Places";
  readonly official = true;

  private get apiKey(): string | undefined {
    return getGoogleMapsApiKey();
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async searchProducts(query: string): Promise<GroceryProduct[]> {
    void query;
    return [];
  }

  async getProductByBarcode(barcode: string): Promise<GroceryProduct | null> {
    void barcode;
    return null;
  }

  /**
   * Find nearby Coles, Woolworths, and ALDI.
   * Prefers classic Places Nearby Search (`type=supermarket`), then New Places API.
   */
  async findNearbySupermarkets(
    lat: number,
    lng: number,
    radiusMeters = 5000,
    postcode?: string
  ): Promise<NearbyStore[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const { nearbySearchSupermarkets } = await import(
        "../google-places-nearby"
      );
      const classic = await nearbySearchSupermarkets({
        lat,
        lng,
        radiusMeters,
        postcode,
      });
      if (classic.length > 0) return classic;
    } catch (err) {
      console.warn("Classic Places Nearby Search failed:", err);
    }

    return this.findNearbySupermarketsNew(lat, lng, radiusMeters);
  }

  /** Places API (New) Nearby Search fallback. */
  private async findNearbySupermarketsNew(
    lat: number,
    lng: number,
    radiusMeters = 5000
  ): Promise<NearbyStore[]> {
    const url = "https://places.googleapis.com/v1/places:searchNearby";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey!,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.currentOpeningHours.openNow,places.addressComponents",
      },
      body: JSON.stringify({
        includedTypes: ["supermarket", "grocery_store"],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Google Places nearby failed (${res.status}): ${text}`);
    }

    const body = (await res.json()) as {
      places?: Array<{
        id?: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        location?: { latitude?: number; longitude?: number };
        currentOpeningHours?: { openNow?: boolean };
        addressComponents?: Array<{
          longText?: string;
          shortText?: string;
          types?: string[];
        }>;
      }>;
    };

    const stores: NearbyStore[] = [];
    for (const place of body.places ?? []) {
      const name = place.displayName?.text ?? "Store";
      const chain = detectChain(name);
      if (chain === "other") continue;

      const placeLat = place.location?.latitude;
      const placeLng = place.location?.longitude;
      if (placeLat == null || placeLng == null) continue;

      const postcode = extractPostcode(
        place.formattedAddress,
        place.addressComponents
      );
      const placeId = place.id;
      const storeId = buildStoreId(chain, placeId, postcode);

      stores.push({
        id: placeId ?? `${name}-${placeLat}-${placeLng}`,
        name,
        chain,
        storeId,
        address: place.formattedAddress ?? "",
        postcode,
        lat: placeLat,
        lng: placeLng,
        distanceMeters: haversineMeters(lat, lng, placeLat, placeLng),
        placeId,
        openNow: place.currentOpeningHours?.openNow,
      });
    }

    return stores.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  /** Official Geocoding API — address / suburb / postcode → lat/lng */
  async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!this.isConfigured()) return null;
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("region", "au");
    url.searchParams.set("key", this.apiKey!);

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const body = (await res.json()) as {
      results?: Array<{
        geometry?: { location?: { lat: number; lng: number } };
      }>;
    };

    const loc = body.results?.[0]?.geometry?.location;
    if (!loc) return null;
    return { lat: loc.lat, lng: loc.lng };
  }
}

export const googlePlacesProvider = new GooglePlacesProvider();
