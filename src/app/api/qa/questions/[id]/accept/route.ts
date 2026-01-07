import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, questions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recomputeQuestionAnswersQuality } from "@/services/answerQuality.service";

/**
 * POST /api/qa/questions/[id]/accept
 * Accept an answer as the best answer (only question author can do this)
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

    const { id: questionId } = await params;
    const body = await request.json();
    const { answerId } = body;

    if (!answerId) {
      return NextResponse.json(
        { error: "شناسه پاسخ الزامی است" },
        { status: 400 }
      );
    }

    // Get the question
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: "سؤال یافت نشد" }, { status: 404 });
    }

    // Only question author can accept answers
    if (session.user.id !== question.authorId) {
      return NextResponse.json(
        { error: "فقط سؤال‌کننده می‌تواند پاسخ را انتخاب کند" },
        { status: 403 }
      );
    }

    // Check if answer exists and belongs to this question
    const [answer] = await db
      .select()
      .from(answers)
      .where(and(eq(answers.id, answerId), eq(answers.questionId, questionId)))
      .limit(1);

    if (!answer) {
      return NextResponse.json(
        { error: "پاسخ در این سؤال یافت نشد" },
        { status: 404 }
      );
    }

    // Can't accept own answer
    if (answer.authorId === session.user.id) {
      return NextResponse.json(
        { error: "نمی‌توانید پاسخ خودتان را به عنوان بهترین انتخاب کنید" },
        { status: 400 }
      );
    }

    // Unaccept all other answers for this question
    await db
      .update(answers)
      .set({ isAccepted: false, acceptedAt: null })
      .where(eq(answers.questionId, questionId));

    // Accept the specified answer
    await db
      .update(answers)
      .set({ isAccepted: true, acceptedAt: new Date() })
      .where(eq(answers.id, answerId));

    // Recompute AQS for all answers in this question
    await recomputeQuestionAnswersQuality(questionId);

    return NextResponse.json({
      message: "پاسخ به عنوان بهترین پاسخ انتخاب شد",
      acceptedAnswerId: answerId,
    });
  } catch (error) {
    console.error("Error accepting answer:", error);
    return NextResponse.json(
      { error: "خطا در انتخاب پاسخ" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/qa/questions/[id]/accept
 * Remove accepted status from current accepted answer
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

    const { id: questionId } = await params;

    // Get the question
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: "سؤال یافت نشد" }, { status: 404 });
    }

    // Only question author can unaccept answers
    if (session.user.id !== question.authorId) {
      return NextResponse.json(
        { error: "فقط سؤال‌کننده می‌تواند انتخاب را لغو کند" },
        { status: 403 }
      );
    }

    // Unaccept all answers for this question
    await db
      .update(answers)
      .set({ isAccepted: false, acceptedAt: null })
      .where(eq(answers.questionId, questionId));

    // Recompute AQS for all answers
    await recomputeQuestionAnswersQuality(questionId);

    return NextResponse.json({
      message: "انتخاب پاسخ لغو شد",
    });
  } catch (error) {
    console.error("Error unaccepting answer:", error);
    return NextResponse.json(
      { error: "خطا در لغو انتخاب" },
      { status: 500 }
    );
  }
}
