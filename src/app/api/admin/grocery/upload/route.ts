import { NextRequest } from "next/server";
import { withAdmin } from "@/lib/route-auth";
import { connectMongo } from "@/lib/mongodb";
import { GroceryProductModel } from "@/models/GroceryProduct";
import { PriceHistoryModel } from "@/models/PriceHistory";
import { normalizeProductName, parseSizeString } from "@/services/grocery/normalizer";
import { handleApiError, jsonOk, jsonError } from "@/lib/api";

/**
 * CSV upload for manual price updates.
 * Expected header: store,name,currentPrice,regularPrice,size,barcode,isOnSpecial,catalogueExpiresAt
 */
export async function POST(request: NextRequest) {
  try {
    const session = await withAdmin(request);
    await connectMongo();

    const contentType = request.headers.get("content-type") || "";
    let csvText = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!file || !(file instanceof File)) {
        return jsonError("file is required", 400);
      }
      csvText = await file.text();
    } else {
      const body = (await request.json()) as { csv?: string };
      csvText = body.csv ?? "";
    }

    if (!csvText.trim()) {
      return jsonError("Empty CSV", 400);
    }

    const rows = parseCsv(csvText);
    if (rows.length < 2) {
      return jsonError(
        "CSV needs a header row and at least one data row",
        400
      );
    }

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name);

    let upserted = 0;
    const now = new Date();

    for (const row of rows.slice(1)) {
      if (row.every((c) => !c.trim())) continue;
      const store = row[idx("store")]?.trim().toLowerCase();
      const name = row[idx("name")]?.trim();
      const currentPrice = Number(
        row[idx("currentprice")] ?? row[idx("current_price")]
      );
      if (!store || !name || !Number.isFinite(currentPrice)) continue;

      const regularPriceRaw =
        row[idx("regularprice")] ?? row[idx("regular_price")];
      const regularPrice = regularPriceRaw ? Number(regularPriceRaw) : undefined;
      const size = row[idx("size")]?.trim() || undefined;
      const barcode = row[idx("barcode")]?.trim() || undefined;
      const isOnSpecial =
        (row[idx("isonspecial")] ?? row[idx("is_on_special")] ?? "")
          .toLowerCase()
          .startsWith("t") ||
        (row[idx("isonspecial")] ?? "") === "1";
      const catalogueExpiresAtRaw =
        row[idx("catalogueexpiresat")] ?? row[idx("catalogue_expires_at")];
      const parsed = parseSizeString(size);
      const externalId = `csv-${store}-${barcode || normalizeProductName(name)}`;

      const doc = await GroceryProductModel.findOneAndUpdate(
        { externalId, store },
        {
          $set: {
            externalId,
            name,
            normalizedName: normalizeProductName(name),
            store,
            currentPrice,
            regularPrice: Number.isFinite(regularPrice) ? regularPrice : undefined,
            size,
            barcode,
            isOnSpecial,
            quantityGrams: parsed?.grams,
            quantityMl: parsed?.ml,
            catalogueExpiresAt: catalogueExpiresAtRaw
              ? new Date(catalogueExpiresAtRaw)
              : undefined,
            dataSource: "manual",
            providerId: `csv:${session.userId}`,
            lastSyncedAt: now,
          },
        },
        { upsert: true, new: true }
      );

      await PriceHistoryModel.create({
        groceryProductId: doc._id,
        store,
        externalId,
        productName: name,
        price: currentPrice,
        regularPrice: Number.isFinite(regularPrice) ? regularPrice : undefined,
        isOnSpecial,
        capturedAt: now,
      });

      upserted += 1;
    }

    return jsonOk({ data: { upserted } });
  } catch (err) {
    return handleApiError(err);
  }
}

function parseCsv(text: string): string[][] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  return lines.map((line) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current);
    return cells;
  });
}
