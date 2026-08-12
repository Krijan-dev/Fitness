import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { withAdmin } from "@/lib/route-auth";
import { jsonOk, handleApiError, jsonError } from "@/lib/api";
import { generateId } from "@/utils/ids";

export async function POST(request: NextRequest) {
  try {
    await withAdmin(request);
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return jsonError("file is required", 400);
    }

    if (!file.type.startsWith("image/")) {
      return jsonError("Only image uploads are allowed", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return jsonError("Image must be under 5MB", 400);
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
      ? ext
      : "jpg";
    const filename = `${generateId()}.${safeExt}`;
    const dir = path.join(process.cwd(), "public", "uploads", "recipes");
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    const url = `/uploads/recipes/${filename}`;
    return jsonOk({ data: { url } }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
