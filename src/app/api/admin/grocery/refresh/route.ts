import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/route-auth";
import {
  getGrocerySyncStatus,
  runWeeklyGroceryRefresh,
} from "@/services/grocery/refresh.service";

export async function GET(request: NextRequest) {
  try {
    await withAdmin(request);
    const status = await getGrocerySyncStatus();
    return NextResponse.json({ data: status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    const status = message.toLowerCase().includes("admin") || message.toLowerCase().includes("auth")
      ? 401
      : 500;
    return NextResponse.json({ error: message }, { status });
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

    return NextResponse.json({ data: status });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Refresh failed";
    const statusCode =
      message.toLowerCase().includes("forbidden") ||
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("token")
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
