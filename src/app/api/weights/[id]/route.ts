import { NextRequest } from "next/server";
import { WeightEntry } from "@/models/WeightEntry";
import { withAuth } from "@/lib/route-auth";
import { weightEntrySchema } from "@/lib/validations";
import { toClientWeightEntry } from "@/lib/mappers";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await withAuth(request);
    const { id } = await context.params;
    const body = await request.json();
    const data = weightEntrySchema.partial().parse(body);

    const doc = await WeightEntry.findOneAndUpdate(
      { userId: session.userId, clientId: id },
      { $set: data },
      { new: true }
    );

    if (!doc) return jsonError("Entry not found", 404);
    return jsonOk({ data: toClientWeightEntry(doc) });
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
    const result = await WeightEntry.deleteOne({
      userId: session.userId,
      clientId: id,
    });
    if (result.deletedCount === 0) return jsonError("Entry not found", 404);
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
