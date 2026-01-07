import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnswerQualityDebug, recomputeAnswerQuality } from "@/services/answerQuality.service";

/**
 * GET /api/admin/qa/answers/[id]/debug
 * Get detailed quality debug info for an answer (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Check admin status
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "دسترسی فقط برای ادمین" }, { status: 403 });
    }

    const { id: answerId } = await params;
    const debugInfo = await getAnswerQualityDebug(answerId);

    if (!debugInfo) {
      return NextResponse.json({ error: "پاسخ یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error("Error getting answer debug:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/qa/answers/[id]/debug
 * Force recompute quality for an answer (Admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Check admin status
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "دسترسی فقط برای ادمین" }, { status: 403 });
    }

    const { id: answerId } = await params;
    const result = await recomputeAnswerQuality(answerId, "CRON");

    if (!result) {
      return NextResponse.json({ error: "خطا در محاسبه مجدد" }, { status: 500 });
    }

    return NextResponse.json({
      message: "محاسبه مجدد انجام شد",
      result,
    });
  } catch (error) {
    console.error("Error recomputing answer quality:", error);
    return NextResponse.json(
      { error: "خطا در محاسبه مجدد" },
      { status: 500 }
    );
  }
}
