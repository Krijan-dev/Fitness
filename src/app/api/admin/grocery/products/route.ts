import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/route-auth";
import { connectMongo } from "@/lib/mongodb";
import { GroceryProductModel } from "@/models/GroceryProduct";
import { PriceHistoryModel } from "@/models/PriceHistory";
import { normalizeProductName } from "@/services/grocery/normalizer";

export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);
    await connectMongo();

    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim();
    const store = searchParams.get("store");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 25)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (store) filter.store = store;
    if (q) {
      filter.$or = [
        { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { barcode: q },
        { brand: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      GroceryProductModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GroceryProductModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: items.map((doc) => ({
        id: String(doc._id),
        ...doc,
        _id: undefined,
      })),
      pagination: { page, limit, total },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await withAdmin(request);
    await connectMongo();
    const body = (await request.json()) as {
      id: string;
      currentPrice?: number;
      regularPrice?: number;
      name?: string;
      isOnSpecial?: boolean;
      size?: string;
      catalogueExpiresAt?: string | null;
    };

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      dataSource: "manual",
      lastSyncedAt: new Date(),
      providerId: `manual:${session.userId}`,
    };
    if (body.currentPrice != null) updates.currentPrice = body.currentPrice;
    if (body.regularPrice != null) updates.regularPrice = body.regularPrice;
    if (body.name != null) {
      updates.name = body.name;
      updates.normalizedName = normalizeProductName(body.name);
    }
    if (body.isOnSpecial != null) updates.isOnSpecial = body.isOnSpecial;
    if (body.size != null) updates.size = body.size;
    if (body.catalogueExpiresAt !== undefined) {
      updates.catalogueExpiresAt = body.catalogueExpiresAt
        ? new Date(body.catalogueExpiresAt)
        : null;
    }

    const doc = await GroceryProductModel.findByIdAndUpdate(
      body.id,
      { $set: updates },
      { new: true }
    );

    if (!doc) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (typeof doc.currentPrice === "number") {
      await PriceHistoryModel.create({
        groceryProductId: doc._id,
        store: doc.store,
        externalId: doc.externalId,
        productName: doc.name,
        price: doc.currentPrice,
        regularPrice: doc.regularPrice,
        unitPrice: doc.unitPrice,
        isOnSpecial: doc.isOnSpecial,
        capturedAt: new Date(),
      });
    }

    return NextResponse.json({ data: doc });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
