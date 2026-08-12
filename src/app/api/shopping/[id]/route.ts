import { NextRequest } from "next/server";
import { ShoppingItem } from "@/models/ShoppingItem";
import { withAuth } from "@/lib/route-auth";
import { shoppingItemSchema } from "@/lib/validations";
import { toClientShoppingItem } from "@/lib/mappers";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await withAuth(request);
    const { id } = await context.params;
    const body = await request.json();
    const data = shoppingItemSchema.partial().parse(body);

    const doc = await ShoppingItem.findOneAndUpdate(
      { userId: session.userId, clientId: id },
      { $set: data },
      { new: true }
    );

    if (!doc) return jsonError("Item not found", 404);
    return jsonOk({ data: toClientShoppingItem(doc) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await withAuth(request);
    const { id } = await context.params;
    const result = await ShoppingItem.deleteOne({
      userId: session.userId,
      clientId: id,
    });
    if (result.deletedCount === 0) return jsonError("Item not found", 404);
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
