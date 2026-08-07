import { NextRequest, NextResponse } from "next/server";
import { priceComparisonService } from "@/services/prices/price-comparison.service";
import {
  getGroceryProviderStatuses,
  getGoogleMapsApiKey,
  getWoolworthsApiKey,
  getColesApiKey,
  priceDataMode,
} from "@/services/grocery/credentials";
import type { StoreProductPrice } from "@/types/price";

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
    const liveCount = products.filter((p) => p.dataSource === "live-api").length;
    const mockCount = products.filter((p) => p.dataSource === "mock").length;
    const source =
      liveCount > 0
        ? "live-or-cache"
        : mockCount > 0
          ? "mock-fallback"
          : "empty";

    const liveProviders = getGroceryProviderStatuses()
      .filter((p) => p.live && p.id !== "google-places")
      .map((p) => p.label);

    const notices: string[] = [];
    if (source === "mock-fallback") {
      notices.push(
        "Direct supermarket endpoints were blocked or empty; showing fallback sample prices. Add RAPIDAPI_KEY for Woolworths/Coles fallback reliability."
      );
    }
    if (!getWoolworthsApiKey() && !getColesApiKey()) {
      notices.push(
        "Optional: set RAPIDAPI_KEY (or WOOLWORTHS_API_KEY / COLES_API_KEY) so RapidAPI can cover 403 responses from direct store sites."
      );
    }
    if (!getGoogleMapsApiKey()) {
      notices.push(
        "Optional: set GOOGLE_MAPS_API_KEY for real nearby store locations."
      );
    }

    return NextResponse.json({
      data: products as StoreProductPrice[],
      source,
      mode,
      location,
      providers: liveProviders,
      notice: notices[0],
      notices,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prices." },
      { status: 500 }
    );
  }
}
