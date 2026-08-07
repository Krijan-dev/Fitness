import { NextRequest } from "next/server";
import { withAdmin } from "@/lib/route-auth";
import { handleApiError, jsonOk } from "@/lib/api";
import {
  getGrocerySyncStatus,
  runWeeklyGroceryRefresh,
} from "@/services/grocery/refresh.service";

export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);
    const status = await getGrocerySyncStatus();
    return jsonOk({ data: status });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await withAdmin(request);
    const body = (await request.json().catch(() => ({}))) as {
      queries?: string[];
    };

    const status = await runWeeklyGroceryRefresh({
      queries: body.queries,
      triggeredBy: session.email ?? session.userId,
    });

    return jsonOk({ data: status });
  } catch (err) {
    return handleApiError(err);
  }
}
