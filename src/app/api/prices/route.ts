import { NextRequest, NextResponse } from "next/server";
import { priceComparisonService } from "@/services/prices/price-comparison.service";
import {
  getGroceryProviderStatuses,
  hasAnyLivePriceProvider,
  priceDataMode,
} from "@/services/grocery/credentials";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("query");
    const location = searchParams.get("location") || "Canberra";

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter is required." },
        { status: 400 }
      );
    }

    const products = await priceComparisonService.searchAllStores(
      query.trim(),
      location
    );

    const mode = priceDataMode();
    const usingMock = !hasAnyLivePriceProvider();
    const liveProviders = getGroceryProviderStatuses()
      .filter((p) => p.live && p.id !== "google-places" && p.id !== "open-food-facts")
      .map((p) => p.label);

    return NextResponse.json({
      data: products,
      source: usingMock ? "mock" : "live-or-cache",
      mode,
      location,
      providers: liveProviders,
      notice: usingMock
        ? "Showing sample AU prices. Add WOOLWORTHS_API_KEY / COLES_API_KEY / RAPIDAPI_KEY (and optionally APIFY_API_TOKEN) to .env.local, then restart the dev server."
        : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prices." },
      { status: 500 }
    );
  }
}
