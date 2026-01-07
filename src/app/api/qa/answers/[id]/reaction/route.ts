import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, answerReactions, questions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recomputeAnswerQuality } from "@/services/answerQuality.service";

/**
 * POST /api/qa/answers/[id]/reaction
 * Add or update reaction to an answer
 * Note: Only asker's reaction counts for AQS scoring
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
    const { type } = body;

    // Validate reaction type
    if (!["helpful", "not_helpful"].includes(type)) {
      return NextResponse.json(
        { error: "نوع واکنش نامعتبر است" },
        { status: 400 }
      );
    }

    // Get the answer and its question
    const [answerData] = await db
      .select({
        answer: answers,
        question: questions,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(eq(answers.id, answerId))
      .limit(1);

    if (!answerData) {
      return NextResponse.json({ error: "پاسخ یافت نشد" }, { status: 404 });
    }

    // Check if user is the question asker (only asker can react for scoring)
    const isAsker = session.user.id === answerData.question.authorId;

    // Check if user is the answer author (can't react to own answer)
    if (session.user.id === answerData.answer.authorId) {
      return NextResponse.json(
        { error: "نمی‌توانید به پاسخ خودتان واکنش دهید" },
        { status: 400 }
      );
    }

    // Check existing reaction
    const [existingReaction] = await db
      .select()
      .from(answerReactions)
      .where(
        and(
          eq(answerReactions.answerId, answerId),
          eq(answerReactions.userId, session.user.id)
        )
      )
      .limit(1);

    let action: "added" | "changed" | "removed";

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Same reaction - remove it (toggle off)
        await db
          .delete(answerReactions)
          .where(eq(answerReactions.id, existingReaction.id));
        action = "removed";
      } else {
        // Different reaction - update it
        await db
          .update(answerReactions)
          .set({ type, createdAt: new Date() })
          .where(eq(answerReactions.id, existingReaction.id));
        action = "changed";
      }
    } else {
      // New reaction
      await db.insert(answerReactions).values({
        answerId,
        userId: session.user.id,
        type,
      });
      action = "added";
    }

    // Only recompute AQS if the reactor is the asker
    if (isAsker) {
      await recomputeAnswerQuality(answerId, "REACTION");
    }

    return NextResponse.json({
      action,
      message:
        action === "added"
          ? "واکنش ثبت شد"
          : action === "changed"
            ? "واکنش تغییر کرد"
            : "واکنش حذف شد",
      isAskerReaction: isAsker,
    });
  } catch (error) {
    console.error("Error handling reaction:", error);
    return NextResponse.json(
      { error: "خطا در ثبت واکنش" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qa/answers/[id]/reaction
 * Get current user's reaction to an answer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ reaction: null });
    }

    const { id: answerId } = await params;

    const [reaction] = await db
      .select({ type: answerReactions.type })
      .from(answerReactions)
      .where(
        and(
          eq(answerReactions.answerId, answerId),
          eq(answerReactions.userId, session.user.id)
        )
      )
      .limit(1);

    return NextResponse.json({
      reaction: reaction?.type || null,
    });
  } catch (error) {
    console.error("Error getting reaction:", error);
    return NextResponse.json(
      { error: "خطا در دریافت واکنش" },
      { status: 500 }
    );
  }
}
