import { NextRequest, NextResponse } from "next/server";
import { batchRecomputeStaleAnswers } from "@/services/answerQuality.service";

/**
 * POST /api/cron/recompute-quality
 * Batch recompute stale answer quality metrics
 * Protected by CRON_TOKEN env variable
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron token
    const authHeader = request.headers.get("authorization");
    const cronToken = process.env.CRON_TOKEN;

    if (!cronToken) {
      console.warn("CRON_TOKEN not set, rejecting request");
      return NextResponse.json(
        { error: "Cron not configured" },
        { status: 500 }
      );
    }

    const providedToken = authHeader?.replace("Bearer ", "");
    if (providedToken !== cronToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get optional parameters
    const { searchParams } = new URL(request.url);
    const maxAgeDays = parseInt(searchParams.get("maxAgeDays") || "7");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Run batch recompute
    const result = await batchRecomputeStaleAnswers(maxAgeDays, limit);

    console.log(
      `[Cron] Recomputed ${result.processed} answers, ${result.updated} changed`
    );

    return NextResponse.json({
      success: true,
      processed: result.processed,
      updated: result.updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cron recompute:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET for health check / manual trigger info
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/cron/recompute-quality",
    method: "POST",
    description: "Batch recompute stale answer quality metrics",
    parameters: {
      maxAgeDays: "Maximum age of metrics before recompute (default: 7)",
      limit: "Maximum number of answers to process (default: 100)",
    },
    authentication: "Bearer token in Authorization header (CRON_TOKEN)",
  });
}
