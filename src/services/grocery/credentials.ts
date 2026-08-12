/**
 * Resolve grocery / maps credentials from env.
 * Supports a shared RapidAPI key so one marketplace subscription can feed
 * both Woolworths and Coles providers as a fallback when direct endpoints are blocked.
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

export function getApifyDatasetId(): string | undefined {
  return process.env.APIFY_DATASET_ID || process.env.ALDI_DATASET_ID || undefined;
}

export interface GroceryProviderStatus {
  id: string;
  label: string;
  configured: boolean;
  live: boolean;
  hint: string;
}

export function getGroceryProviderStatuses(): GroceryProviderStatus[] {
  const woolworthsRapid = Boolean(getWoolworthsApiKey());
  const colesRapid = Boolean(getColesApiKey());
  const aldi = Boolean(
    getApifyToken() || process.env.ALDI_CACHE_URL || getApifyDatasetId()
  );
  const iga = Boolean(process.env.IGA_CACHE_URL);
  const google = Boolean(getGoogleMapsApiKey());
  const mode = process.env.PRICE_PROVIDER_MODE || "auto";
  const forceMock = mode === "mock";
  const directEnabled = !forceMock;

  return [
    {
      id: "google-places",
      label: "Google Maps Places",
      configured: google,
      live: google && !forceMock,
      hint: google
        ? "Nearby Search type=supermarket"
        : "Set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    },
    {
      id: "woolworths",
      label: "Woolworths (direct + RapidAPI)",
      configured: directEnabled,
      live: directEnabled,
      hint: woolworthsRapid
        ? "Direct UI search with RapidAPI fallback"
        : "Direct UI search; set RAPIDAPI_KEY for 403 fallback",
    },
    {
      id: "coles",
      label: "Coles (direct + RapidAPI)",
      configured: directEnabled,
      live: directEnabled,
      hint: colesRapid
        ? "Direct BFF search with RapidAPI fallback"
        : "Direct BFF search; set RAPIDAPI_KEY for 403 fallback",
    },
    {
      id: "aldi",
      label: "ALDI (Apify / cache)",
      configured: aldi,
      live: aldi && !forceMock,
      hint: aldi
        ? getApifyDatasetId() || process.env.ALDI_CACHE_URL
          ? "Apify dataset catalogue"
          : "Apify Actor live runs"
        : "Set APIFY_API_TOKEN + APIFY_DATASET_ID (or ALDI_CACHE_URL)",
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
      hint: "Barcode metadata & images (EAN-13)",
    },
  ];
}

/**
 * Direct Woolworths/Coles searches run whenever mode !== mock.
 * RapidAPI / Apify keys improve reliability when direct endpoints return 403.
 */
export function hasAnyLivePriceProvider(): boolean {
  return (process.env.PRICE_PROVIDER_MODE || "auto") !== "mock";
}

export function priceDataMode(): "mock" | "live" | "auto-mock" | "auto-live" {
  const mode = process.env.PRICE_PROVIDER_MODE || "auto";
  if (mode === "mock") return "mock";
  if (mode === "live") return "live";
  return "auto-live";
}
