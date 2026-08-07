import { NextRequest } from "next/server";
import { withAdmin } from "@/lib/route-auth";
import { getGrocerySyncStatus } from "@/services/grocery/refresh.service";
import { connectMongo } from "@/lib/mongodb";
import { GroceryProductModel } from "@/models/GroceryProduct";
import { handleApiError, jsonOk } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);
    await connectMongo();
    const [status, total, specials] = await Promise.all([
      getGrocerySyncStatus(),
      GroceryProductModel.countDocuments(),
      GroceryProductModel.countDocuments({ isOnSpecial: true }),
    ]);

    return jsonOk({
      data: {
        ...status,
        productCount: total,
        specialsCount: specials,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
