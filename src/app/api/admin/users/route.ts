import { NextRequest } from "next/server";
import { User } from "@/models/User";
import { withAdmin } from "@/lib/route-auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(request.nextUrl.searchParams.get("limit") || 20))
    );
    const skip = (page - 1) * limit;

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email role createdAt lastActivityAt disabled")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return jsonOk({
      data: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt?.toISOString?.() ?? null,
        lastActivityAt: u.lastActivityAt?.toISOString?.() ?? null,
        disabled: Boolean(u.disabled),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
