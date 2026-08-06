import { NextRequest } from "next/server";
import { ShoppingItem } from "@/models/ShoppingItem";
import { withAuth } from "@/lib/route-auth";
import { shoppingItemSchema } from "@/lib/validations";
import { toClientShoppingItem } from "@/lib/mappers";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";
import { generateId } from "@/utils/ids";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const docs = await ShoppingItem.find({ userId: session.userId }).sort({
      createdAt: -1,
    });
    return jsonOk({ data: docs.map(toClientShoppingItem) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const data = shoppingItemSchema.parse(body);
    const clientId = typeof body.id === "string" ? body.id : generateId();

    const doc = await ShoppingItem.create({
      userId: session.userId,
      clientId,
      ...data,
    });

    return jsonOk({ data: toClientShoppingItem(doc) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const items = z
      .array(shoppingItemSchema.extend({ id: z.string() }))
      .parse(body.items ?? body);

    await ShoppingItem.deleteMany({ userId: session.userId });
    if (items.length > 0) {
      await ShoppingItem.insertMany(
        items.map((item) => ({
          userId: session.userId,
          clientId: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          preferredBrand: item.preferredBrand,
          preferredStore: item.preferredStore,
          notes: item.notes,
          purchased: item.purchased,
          sourceRecipeIds: item.sourceRecipeIds,
        }))
      );
    }

    const docs = await ShoppingItem.find({ userId: session.userId });
    return jsonOk({ data: docs.map(toClientShoppingItem) });
  } catch (error) {
    return handleApiError(error);
  }
}
