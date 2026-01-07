import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, questions, answerReactions, userExpertiseStats } from "@/lib/db/schema";
import { eq, and, desc, sql, or, gt } from "drizzle-orm";

/**
 * GET /api/users/[userId]/qa-stats - Get user's Q&A stats for public profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get user expertise stats
    const [stats] = await db
      .select()
      .from(userExpertiseStats)
      .where(eq(userExpertiseStats.userId, userId))
      .limit(1);

    // Get total answers count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(answers)
      .where(and(eq(answers.authorId, userId), eq(answers.isHidden, false)));

    const totalAnswers = totalResult?.count || 0;

    // Get expert answers count (answers with expertBadgeCount > 0)
    const [expertResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(answers)
      .where(
        and(
          eq(answers.authorId, userId),
          eq(answers.isHidden, false),
          gt(answers.expertBadgeCount, 0)
        )
      );

    const expertAnswers = expertResult?.count || 0;

    // Get top category from answers
    const categoryResult = await db
      .select({
        category: questions.category,
        count: sql<number>`count(*)::int`,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(and(eq(answers.authorId, userId), eq(answers.isHidden, false)))
      .groupBy(questions.category)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    const topCategory = categoryResult[0]?.category || null;

    // Get featured answers (answers with reactions)
    const featuredAnswers = await db
      .select({
        answerId: answers.id,
        questionId: questions.id,
        questionTitle: questions.title,
        helpfulCount: answers.helpfulCount,
        expertBadgeCount: answers.expertBadgeCount,
        createdAt: answers.createdAt,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(
        and(
          eq(answers.authorId, userId),
          eq(answers.isHidden, false),
          eq(questions.isHidden, false),
          or(gt(answers.helpfulCount, 0), gt(answers.expertBadgeCount, 0))
        )
      )
      .orderBy(desc(answers.expertBadgeCount), desc(answers.helpfulCount))
      .limit(3);

    return NextResponse.json({
      totalAnswers,
      expertAnswers,
      topCategory,
      helpfulReactions: stats?.helpfulReactions || 0,
      expertReactions: stats?.expertReactions || 0,
      featuredAnswers: featuredAnswers.map((a) => ({
        answerId: a.answerId,
        questionId: a.questionId,
        questionTitle: a.questionTitle,
        helpfulCount: a.helpfulCount,
        expertBadgeCount: a.expertBadgeCount,
      })),
    });
  } catch (error) {
    console.error("Error fetching user Q&A stats:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آمار Q&A" },
      { status: 500 }
    );
  }
}
