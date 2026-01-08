import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, questions, answerReactions, userExpertiseStats, answerQualityMetrics } from "@/lib/db/schema";
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

    // Get AQS metrics
    const aqsStats = await db
      .select({
        avgAqs: sql<number>`COALESCE(AVG(${answerQualityMetrics.aqs}), 0)::int`,
        totalAqs: sql<number>`COALESCE(SUM(${answerQualityMetrics.aqs}), 0)::int`,
        starCount: sql<number>`COUNT(CASE WHEN ${answerQualityMetrics.label} = 'STAR' THEN 1 END)::int`,
        proCount: sql<number>`COUNT(CASE WHEN ${answerQualityMetrics.label} = 'PRO' THEN 1 END)::int`,
        usefulCount: sql<number>`COUNT(CASE WHEN ${answerQualityMetrics.label} = 'USEFUL' THEN 1 END)::int`,
      })
      .from(answerQualityMetrics)
      .innerJoin(answers, eq(answerQualityMetrics.answerId, answers.id))
      .where(and(eq(answers.authorId, userId), eq(answers.isHidden, false)));

    const { avgAqs, totalAqs, starCount, proCount, usefulCount } = aqsStats[0] || {
      avgAqs: 0,
      totalAqs: 0,
      starCount: 0,
      proCount: 0,
      usefulCount: 0,
    };

    // Get accepted answers count
    const [acceptedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(answers)
      .where(
        and(
          eq(answers.authorId, userId),
          eq(answers.isHidden, false),
          eq(answers.isAccepted, true)
        )
      );

    const acceptedAnswers = acceptedResult?.count || 0;

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
      acceptedAnswers,
      topCategory,
      helpfulReactions: stats?.helpfulReactions || 0,
      expertReactions: stats?.expertReactions || 0,
      // AQS metrics
      avgAqs,
      totalAqs,
      starCount,
      proCount,
      usefulCount,
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
