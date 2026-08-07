import { NextRequest, NextResponse } from "next/server";
import { priceComparisonService } from "@/services/prices/price-comparison.service";

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

    const mode = process.env.PRICE_PROVIDER_MODE || "auto";
    const hasLiveKeys = Boolean(
      process.env.WOOLWORTHS_API_KEY ||
        process.env.COLES_API_KEY ||
        process.env.APIFY_API_TOKEN
    );

    return NextResponse.json({
      data: products,
      source: mode === "mock" || !hasLiveKeys ? "mock" : "live-or-cache",
      location,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prices." },
      { status: 500 }
    );
  }
}
