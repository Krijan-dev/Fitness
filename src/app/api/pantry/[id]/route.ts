import { NextRequest } from "next/server";
import { PantryItem } from "@/models/PantryItem";
import { withAuth } from "@/lib/route-auth";
import { pantryItemSchema } from "@/lib/validations";
import { toClientPantryItem } from "@/lib/mappers";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await withAuth(request);
    const { id } = await context.params;
    const body = await request.json();
    const data = pantryItemSchema.partial().parse(body);

    const doc = await PantryItem.findOneAndUpdate(
      { userId: session.userId, clientId: id },
      { $set: data },
      { new: true }
    );

    if (!doc) return jsonError("Item not found", 404);
    return jsonOk({ data: toClientPantryItem(doc) });
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
    const result = await PantryItem.deleteOne({
      userId: session.userId,
      clientId: id,
    });
    if (result.deletedCount === 0) return jsonError("Item not found", 404);
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
