import { NextRequest, NextResponse } from "next/server";
import { priceComparisonService } from "@/services/prices/price-comparison.service";
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

    return NextResponse.json({
      data: products as StoreProductPrice[],
      location,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prices." },
      { status: 500 }
    );
  }
}
