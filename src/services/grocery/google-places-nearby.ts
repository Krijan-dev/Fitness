import { getGoogleMapsApiKey } from "./credentials";
import {
  buildStoreId,
  detectChain,
  extractPostcode,
  haversineMeters,
} from "./places-utils";
import type { NearbyStore } from "@/types/grocery";

/**
 * Official Google Places Nearby Search (legacy Places API).
 * Docs: https://developers.google.com/maps/documentation/places/web-service/search-nearby
 *
 * GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
 *   ?location={lat},{lng}&radius=5000&type=supermarket&key=...
 */
export async function nearbySearchSupermarkets(options: {
  lat: number;
  lng: number;
  radiusMeters?: number;
  postcode?: string;
}): Promise<NearbyStore[]> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) return [];

  const radius = options.radiusMeters ?? 5000;
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
  );
  url.searchParams.set("location", `${options.lat},${options.lng}`);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("type", "supermarket");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Google Places Nearby Search failed (${res.status})`);
  }

  const body = (await res.json()) as {
    status?: string;
    error_message?: string;
    results?: Array<{
      place_id?: string;
      name?: string;
      vicinity?: string;
      formatted_address?: string;
      geometry?: { location?: { lat: number; lng: number } };
      opening_hours?: { open_now?: boolean };
      types?: string[];
    }>;
  };

  if (body.status && body.status !== "OK" && body.status !== "ZERO_RESULTS") {
    throw new Error(
      body.error_message || `Google Places status: ${body.status}`
    );
  }

  const stores: NearbyStore[] = [];
  for (const place of body.results ?? []) {
    const name = place.name ?? "Store";
    const chain = detectChain(name);
    if (chain === "other") continue;

    const placeLat = place.geometry?.location?.lat;
    const placeLng = place.geometry?.location?.lng;
    if (placeLat == null || placeLng == null) continue;

    const address = place.vicinity || place.formatted_address || "";
    const postcode =
      extractPostcode(address) || options.postcode || undefined;
    const placeId = place.place_id;

    stores.push({
      id: placeId ?? `${name}-${placeLat}-${placeLng}`,
      name,
      chain,
      storeId: buildStoreId(chain, placeId, postcode),
      address,
      postcode,
      lat: placeLat,
      lng: placeLng,
      distanceMeters: haversineMeters(
        options.lat,
        options.lng,
        placeLat,
        placeLng
      ),
      placeId,
      openNow: place.opening_hours?.open_now,
    });
  }

  return stores.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/** Geocode an Australian postcode / suburb to lat/lng via Geocoding API. */
export async function geocodeAustralianAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("region", "au");
  url.searchParams.set("components", "country:AU");
  url.searchParams.set("key", apiKey);

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
