import { NextRequest } from "next/server";
import { PantryItem } from "@/models/PantryItem";
import { withAuth } from "@/lib/route-auth";
import { pantryItemSchema } from "@/lib/validations";
import { toClientPantryItem } from "@/lib/mappers";
import { jsonOk, handleApiError } from "@/lib/api";
import { generateId } from "@/utils/ids";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const docs = await PantryItem.find({ userId: session.userId }).sort({
      createdAt: -1,
    });
    return jsonOk({ data: docs.map(toClientPantryItem) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const data = pantryItemSchema.parse(body);
    const clientId = typeof body.id === "string" ? body.id : generateId();

    const doc = await PantryItem.create({
      userId: session.userId,
      clientId,
      ...data,
    });

    return jsonOk({ data: toClientPantryItem(doc) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const items = z
      .array(pantryItemSchema.extend({ id: z.string() }))
      .parse(body.items ?? body);

    await PantryItem.deleteMany({ userId: session.userId });
    if (items.length > 0) {
      await PantryItem.insertMany(
        items.map((item) => ({
          userId: session.userId,
          clientId: item.id,
          ...item,
        }))
      );
    }

    const docs = await PantryItem.find({ userId: session.userId });
    return jsonOk({ data: docs.map(toClientPantryItem) });
  } catch (error) {
    return handleApiError(error);
  }
}
