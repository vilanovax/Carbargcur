import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, userExpertiseStats } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/qa/questions/[id]/answers - Submit an answer
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
    const { body: answerBody } = body;

    // Validate
    if (!answerBody?.trim()) {
      return NextResponse.json(
        { error: "متن پاسخ الزامی است" },
        { status: 400 }
      );
    }

    // Check question exists and is not hidden
    const [question] = await db
      .select()
      .from(questions)
      .where(and(eq(questions.id, questionId), eq(questions.isHidden, false)))
      .limit(1);

    if (!question) {
      return NextResponse.json(
        { error: "سؤال یافت نشد" },
        { status: 404 }
      );
    }

    // Rate limiting: Max 10 answers per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const userAnswersToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(answers)
      .where(
        and(
          eq(answers.authorId, session.user.id),
          sql`${answers.createdAt} >= ${todayIso}::timestamp`
        )
      );

    if (Number(userAnswersToday[0]?.count || 0) >= 10) {
      return NextResponse.json(
        { error: "شما امروز به حداکثر تعداد پاسخ رسیده‌اید (۱۰ پاسخ)" },
        { status: 429 }
      );
    }

    // Create answer
    const [newAnswer] = await db
      .insert(answers)
      .values({
        questionId,
        authorId: session.user.id,
        body: answerBody.trim(),
      })
      .returning();

    // Update question's answer count
    await db
      .update(questions)
      .set({
        answersCount: sql`${questions.answersCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, questionId));

    // Update user expertise stats
    await updateExpertiseStats(session.user.id, question.category);

    return NextResponse.json(
      {
        answer: {
          id: newAnswer.id,
          body: newAnswer.body,
          createdAt: newAnswer.createdAt,
        },
        message: "پاسخ با موفقیت ثبت شد",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "خطا در ثبت پاسخ" },
      { status: 500 }
    );
  }
}

// Helper function to update expertise stats
async function updateExpertiseStats(userId: string, category: string) {
  try {
    const [existing] = await db
      .select()
      .from(userExpertiseStats)
      .where(eq(userExpertiseStats.userId, userId))
      .limit(1);

    if (existing) {
      await db
        .update(userExpertiseStats)
        .set({
          totalAnswers: sql`${userExpertiseStats.totalAnswers} + 1`,
          topCategory: category, // Simple: just use the latest category
          updatedAt: new Date(),
        })
        .where(eq(userExpertiseStats.userId, userId));
    } else {
      await db.insert(userExpertiseStats).values({
        userId,
        totalAnswers: 1,
        topCategory: category,
      });
    }
  } catch (error) {
    console.error("Error updating expertise stats:", error);
  }
}
