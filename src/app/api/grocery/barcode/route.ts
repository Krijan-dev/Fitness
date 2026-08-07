import { NextRequest, NextResponse } from "next/server";
import { lookupBarcode } from "@/services/grocery/grocery-search.service";

export async function GET(request: NextRequest) {
  try {
    const barcode = request.nextUrl.searchParams.get("barcode");
    if (!barcode?.trim()) {
      return NextResponse.json(
        { error: "barcode is required" },
        { status: 400 }
      );
    }

    const result = await lookupBarcode(barcode.trim());
    return NextResponse.json({
      data: {
        metadata: result.metadata,
        storeMatches: result.storeMatches,
      },
      source: result.source,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Barcode lookup failed" },
      { status: 500 }
    );
  }
}
