import { NextResponse } from "next/server";
import {
  getGroceryProviderStatuses,
  getGoogleMapsApiKey,
  hasAnyLivePriceProvider,
  priceDataMode,
} from "@/services/grocery/credentials";

/** Public status of grocery integrations (no secrets exposed). */
export async function GET() {
  const providers = getGroceryProviderStatuses();
  const mode = priceDataMode();
  const missing = providers
    .filter((p) => !p.configured && p.id !== "open-food-facts" && p.id !== "iga")
    .map((p) => p.hint);

  return NextResponse.json({
    data: {
      mode,
      usingMockPrices: !hasAnyLivePriceProvider(),
      usingDemoStores: !getGoogleMapsApiKey(),
      providers,
      setupHint:
        mode === "auto-mock" || mode === "mock"
          ? "Add API keys to .env.local and restart `npm run dev`. See .env.example."
          : "Live grocery providers are configured.",
      missingHints: missing,
    },
  });
}
