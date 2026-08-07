import { NextRequest, NextResponse } from "next/server";
import { searchGroceryProducts } from "@/services/grocery/grocery-search.service";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query");
    if (!query?.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const result = await searchGroceryProducts(query.trim());
    return NextResponse.json({
      data: result.products,
      source: result.source,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Grocery search failed" },
      { status: 500 }
    );
  }
}
