import type { GroceryProduct, NearbyStore } from "@/types/grocery";
import type { GroceryProvider } from "./grocery-provider.interface";

/**
 * Official Google Places API (Nearby Search New) for supermarket locations.
 * Product search methods are intentionally empty — use price providers for SKUs.
 * Docs: https://developers.google.com/maps/documentation/places/web-service/nearby-search
 */
export class GooglePlacesProvider implements GroceryProvider {
  readonly id = "google-places";
  readonly displayName = "Google Maps Places";
  readonly official = true;

  private get apiKey(): string | undefined {
    return (
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      undefined
    );
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
   * Find nearby Coles, Woolworths, ALDI, and IGA using Places API (New).
   * `includedTypes` uses Google Places `supermarket` / `grocery_store`.
   */
  async findNearbySupermarkets(
    lat: number,
    lng: number,
    radiusMeters = 5000
  ): Promise<NearbyStore[]> {
    if (!this.isConfigured()) {
      return [];
    }

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

export function detectChain(name: string): NearbyStore["chain"] {
  const n = name.toLowerCase();
  if (n.includes("woolworth") || n.includes("woolies")) return "woolworths";
  if (n.includes("coles")) return "coles";
  if (n.includes("aldi")) return "aldi";
  if (n.includes("iga")) return "iga";
  return "other";
}

export function extractPostcode(
  address?: string,
  components?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>
): string | undefined {
  const fromComponents = components?.find((c) =>
    c.types?.includes("postal_code")
  );
  if (fromComponents?.shortText || fromComponents?.longText) {
    return fromComponents.shortText || fromComponents.longText;
  }
  if (!address) return undefined;
  const match = address.match(/\b(\d{4})\b/);
  return match?.[1];
}

/** Derive a chain-specific store id for price feeds that need location context. */
export function buildStoreId(
  chain: NearbyStore["chain"],
  placeId?: string,
  postcode?: string
): string {
  const suffix = placeId?.replace(/^places\//, "") ?? postcode ?? "unknown";
  return `${chain}:${suffix}`;
}

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export const googlePlacesProvider = new GooglePlacesProvider();
