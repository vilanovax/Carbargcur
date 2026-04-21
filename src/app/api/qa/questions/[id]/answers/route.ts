import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, userExpertiseStats, users, profiles } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { notifyNewAnswer } from "@/lib/notifications";
import { requireAuth } from "@/lib/api/auth";
import { validateJson } from "@/lib/api/validate";
import { answerCreateSchema } from "@/lib/api/schemas";
import { enforceRateLimit } from "@/lib/api/rate-limit";

/**
 * POST /api/qa/questions/[id]/answers - Submit an answer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const limited = enforceRateLimit(request, "qa:answer:create", 30, 10 * 60 * 1000);
    if (limited) return limited;

    const { id: questionId } = await params;

    const parsed = await validateJson(request, answerCreateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { body: answerBody } = parsed;

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
          eq(answers.authorId, auth.userId),
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
        authorId: auth.userId,
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
    await updateExpertiseStats(auth.userId, question.category);

    // Send notification to question author (if not self-answer)
    if (question.authorId !== auth.userId) {
      try {
        // Get answerer's name
        const [answererProfile] = await db
          .select({ fullName: profiles.fullName })
          .from(profiles)
          .where(eq(profiles.userId, auth.userId))
          .limit(1);

        const answererName = answererProfile?.fullName || "کاربر";

        await notifyNewAnswer({
          questionAuthorId: question.authorId,
          answererName,
          questionId: question.id,
          questionTitle: question.title,
        });
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Don't fail the request if notification fails
      }
    }

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
