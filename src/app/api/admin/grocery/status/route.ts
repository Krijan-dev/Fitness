import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/route-auth";
import { getGrocerySyncStatus } from "@/services/grocery/refresh.service";
import { connectMongo } from "@/lib/mongodb";
import { GroceryProductModel } from "@/models/GroceryProduct";

export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);
    await connectMongo();
    const [status, total, specials] = await Promise.all([
      getGrocerySyncStatus(),
      GroceryProductModel.countDocuments(),
      GroceryProductModel.countDocuments({ isOnSpecial: true }),
    ]);

    return NextResponse.json({
      data: {
        ...status,
        productCount: total,
        specialsCount: specials,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
