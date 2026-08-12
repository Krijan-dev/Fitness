import { NextRequest } from "next/server";
import { withAdmin } from "@/lib/route-auth";
import { handleApiError, jsonOk } from "@/lib/api";
import {
  getGroceryProviderStatuses,
  getGoogleMapsApiKey,
  hasAnyLivePriceProvider,
  priceDataMode,
} from "@/services/grocery/credentials";
import { getAldiCatalogueStatus } from "@/services/grocery/aldi-catalogue.service";

/**
 * Admin-only grocery integration health.
 * Shows which providers are live vs need configuration — not exposed to end users.
 */
export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);

    const providers = getGroceryProviderStatuses().map((p) => ({
      id: p.id,
      label: p.label,
      configured: p.configured,
      live: p.live,
      hint: p.hint,
      health: p.live ? ("live" as const) : ("needs-setup" as const),
    }));

    const live = providers.filter((p) => p.health === "live");
    const needsWork = providers.filter((p) => p.health === "needs-setup");

    let aldiCatalogue: Awaited<ReturnType<typeof getAldiCatalogueStatus>> | null =
      null;
    try {
      if (process.env.MONGODB_URI) {
        aldiCatalogue = await getAldiCatalogueStatus();
      }
    } catch {
      aldiCatalogue = null;
    }

    return jsonOk({
      data: {
        mode: priceDataMode(),
        usingFallbackPrices: !hasAnyLivePriceProvider(),
        mapsConfigured: Boolean(getGoogleMapsApiKey()),
        providers,
        liveCount: live.length,
        needsWorkCount: needsWork.length,
        aldiCatalogue,
        summary:
          needsWork.length === 0
            ? "All grocery integrations look live."
            : `${needsWork.length} integration${needsWork.length === 1 ? "" : "s"} need configuration or keys.`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
