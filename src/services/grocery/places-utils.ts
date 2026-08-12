import type { NearbyStore } from "@/types/grocery";

export function detectChain(name: string): NearbyStore["chain"] {
  const n = name.toLowerCase();
  if (n.includes("woolworth") || n.includes("woolies")) return "woolworths";
  if (n.includes("coles")) return "coles";
  if (n.includes("aldi")) return "aldi";
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
