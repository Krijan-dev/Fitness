import { NextRequest } from "next/server";
import { WeightEntry } from "@/models/WeightEntry";
import { withAuth } from "@/lib/route-auth";
import { weightEntrySchema } from "@/lib/validations";
import { toClientWeightEntry } from "@/lib/mappers";
import { jsonOk, handleApiError } from "@/lib/api";
import { generateId } from "@/utils/ids";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const docs = await WeightEntry.find({ userId: session.userId }).sort({
      date: -1,
    });
    return jsonOk({ data: docs.map(toClientWeightEntry) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const data = weightEntrySchema.parse(body);
    const clientId = typeof body.id === "string" ? body.id : generateId();

    const doc = await WeightEntry.create({
      userId: session.userId,
      clientId,
      ...data,
    });

    return jsonOk({ data: toClientWeightEntry(doc) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await withAuth(request);
    const body = await request.json();
    const entries = z
      .array(weightEntrySchema.extend({ id: z.string() }))
      .parse(body.entries ?? body);

    await WeightEntry.deleteMany({ userId: session.userId });
    if (entries.length > 0) {
      await WeightEntry.insertMany(
        entries.map((entry) => ({
          userId: session.userId,
          clientId: entry.id,
          ...entry,
        }))
      );
    }

    const docs = await WeightEntry.find({ userId: session.userId });
    return jsonOk({ data: docs.map(toClientWeightEntry) });
  } catch (error) {
    return handleApiError(error);
  }
}
