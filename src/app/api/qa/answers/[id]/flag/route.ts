import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, answerFlags } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recomputeAnswerQuality } from "@/services/answerQuality.service";

// Valid flag reasons
const VALID_REASONS = ["SPAM", "ABUSE", "MISLEADING", "LOW_QUALITY", "OTHER"];

const REASON_LABELS: Record<string, string> = {
  SPAM: "هرزنامه",
  ABUSE: "محتوای نامناسب",
  MISLEADING: "اطلاعات گمراه‌کننده",
  LOW_QUALITY: "کیفیت پایین",
  OTHER: "سایر",
};

/**
 * POST /api/qa/answers/[id]/flag
 * Flag an answer as inappropriate
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

    const { id: answerId } = await params;
    const body = await request.json();
    const { reason, note } = body;

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "دلیل گزارش نامعتبر است" },
        { status: 400 }
      );
    }

    // Check if answer exists
    const [answer] = await db
      .select()
      .from(answers)
      .where(eq(answers.id, answerId))
      .limit(1);

    if (!answer) {
      return NextResponse.json({ error: "پاسخ یافت نشد" }, { status: 404 });
    }

    // Can't flag own answer
    if (session.user.id === answer.authorId) {
      return NextResponse.json(
        { error: "نمی‌توانید پاسخ خودتان را گزارش کنید" },
        { status: 400 }
      );
    }

    // Check existing flag from this user
    const [existingFlag] = await db
      .select()
      .from(answerFlags)
      .where(
        and(
          eq(answerFlags.answerId, answerId),
          eq(answerFlags.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingFlag) {
      // Update existing flag
      await db
        .update(answerFlags)
        .set({ reason, note: note || null, createdAt: new Date() })
        .where(eq(answerFlags.id, existingFlag.id));
    } else {
      // Create new flag
      await db.insert(answerFlags).values({
        answerId,
        userId: session.user.id,
        reason,
        note: note || null,
      });
    }

    // Recompute AQS (flags affect quality score)
    await recomputeAnswerQuality(answerId, "FLAG");

    return NextResponse.json({
      message: "گزارش ثبت شد",
      reason: REASON_LABELS[reason] || reason,
    });
  } catch (error) {
    console.error("Error flagging answer:", error);
    return NextResponse.json(
      { error: "خطا در ثبت گزارش" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/qa/answers/[id]/flag
 * Remove a flag from an answer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id: answerId } = await params;

    // Delete user's flag
    await db
      .delete(answerFlags)
      .where(
        and(
          eq(answerFlags.answerId, answerId),
          eq(answerFlags.userId, session.user.id)
        )
      );

    // Recompute AQS
    await recomputeAnswerQuality(answerId, "FLAG");

    return NextResponse.json({ message: "گزارش حذف شد" });
  } catch (error) {
    console.error("Error removing flag:", error);
    return NextResponse.json(
      { error: "خطا در حذف گزارش" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qa/answers/[id]/flag
 * Get current user's flag for an answer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ flag: null });
    }

    const { id: answerId } = await params;

    const [flag] = await db
      .select({ reason: answerFlags.reason, note: answerFlags.note })
      .from(answerFlags)
      .where(
        and(
          eq(answerFlags.answerId, answerId),
          eq(answerFlags.userId, session.user.id)
        )
      )
      .limit(1);

    return NextResponse.json({
      flag: flag
        ? {
            reason: flag.reason,
            reasonLabel: REASON_LABELS[flag.reason] || flag.reason,
            note: flag.note,
          }
        : null,
    });
  } catch (error) {
    console.error("Error getting flag:", error);
    return NextResponse.json(
      { error: "خطا در دریافت گزارش" },
      { status: 500 }
    );
  }
}
