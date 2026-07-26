import { NextRequest, NextResponse } from "next/server";
import { priceComparisonService } from "@/services/prices/price-comparison.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("query");
    const location = searchParams.get("location") || "Canberra";
    const providerMode = process.env.PRICE_PROVIDER_MODE || "mock";

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter is required." },
        { status: 400 }
      );
    }

    if (providerMode !== "mock") {
      return NextResponse.json(
        { error: "Live price providers are not yet configured. Use mock mode." },
        { status: 503 }
      );
    }

    const products = await priceComparisonService.searchAllStores(
      query.trim(),
      location
    );

    return NextResponse.json({
      data: products,
      source: "mock",
      location,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prices." },
      { status: 500 }
    );
  }
}
