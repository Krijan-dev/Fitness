/**
 * Resolve grocery / maps credentials from env.
 * Supports a shared RapidAPI key so one marketplace subscription can feed
 * both Woolworths and Coles providers.
 */

export function getRapidApiKey(): string | undefined {
  return (
    process.env.RAPIDAPI_KEY ||
    process.env.THIRD_PARTY_GROCERY_API_KEY ||
    undefined
  );
}

export function getWoolworthsApiKey(): string | undefined {
  return process.env.WOOLWORTHS_API_KEY || getRapidApiKey() || undefined;
}

export function getColesApiKey(): string | undefined {
  return process.env.COLES_API_KEY || getRapidApiKey() || undefined;
}

export function getGoogleMapsApiKey(): string | undefined {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    undefined
  );
}

export function getApifyToken(): string | undefined {
  return process.env.APIFY_API_TOKEN || undefined;
}

export interface GroceryProviderStatus {
  id: string;
  label: string;
  configured: boolean;
  live: boolean;
  hint: string;
}

export function getGroceryProviderStatuses(): GroceryProviderStatus[] {
  const woolworths = Boolean(getWoolworthsApiKey());
  const coles = Boolean(getColesApiKey());
  const aldi = Boolean(getApifyToken() || process.env.ALDI_CACHE_URL);
  const iga = Boolean(process.env.IGA_CACHE_URL);
  const google = Boolean(getGoogleMapsApiKey());
  const mode = process.env.PRICE_PROVIDER_MODE || "auto";
  const forceMock = mode === "mock";

  return [
    {
      id: "google-places",
      label: "Google Maps Places",
      configured: google,
      live: google && !forceMock,
      hint: google
        ? "Nearby Coles / Woolworths / ALDI / IGA"
        : "Set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    },
    {
      id: "woolworths",
      label: "Woolworths (RapidAPI)",
      configured: woolworths,
      live: woolworths && !forceMock,
      hint: woolworths
        ? "Live product search"
        : "Set WOOLWORTHS_API_KEY or RAPIDAPI_KEY",
    },
    {
      id: "coles",
      label: "Coles (RapidAPI)",
      configured: coles,
      live: coles && !forceMock,
      hint: coles
        ? "Live product search"
        : "Set COLES_API_KEY or RAPIDAPI_KEY",
    },
    {
      id: "aldi",
      label: "ALDI (Apify / cache)",
      configured: aldi,
      live: aldi && !forceMock,
      hint: aldi
        ? "Live / cached specials"
        : "Set APIFY_API_TOKEN or ALDI_CACHE_URL",
    },
    {
      id: "iga",
      label: "IGA (cache)",
      configured: iga,
      live: iga && !forceMock,
      hint: iga ? "Cached catalogue" : "Set IGA_CACHE_URL (optional)",
    },
    {
      id: "open-food-facts",
      label: "Open Food Facts",
      configured: true,
      live: !forceMock,
      hint: "Barcode metadata & images (no key required)",
    },
  ];
}

export function hasAnyLivePriceProvider(): boolean {
  if ((process.env.PRICE_PROVIDER_MODE || "auto") === "mock") return false;
  return Boolean(
    getWoolworthsApiKey() ||
      getColesApiKey() ||
      getApifyToken() ||
      process.env.ALDI_CACHE_URL ||
      process.env.IGA_CACHE_URL
  );
}

export function priceDataMode(): "mock" | "live" | "auto-mock" | "auto-live" {
  const mode = process.env.PRICE_PROVIDER_MODE || "auto";
  if (mode === "mock") return "mock";
  if (mode === "live") return "live";
  return hasAnyLivePriceProvider() ? "auto-live" : "auto-mock";
}
