import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, questions, answerQualityMetrics } from "@/lib/db/schema";
import { eq, and, desc, sql, or, gt } from "drizzle-orm";

function getExpertLevel(score: number): string {
  if (score >= 1000) return "top_expert";
  if (score >= 500) return "expert";
  if (score >= 200) return "senior";
  if (score >= 100) return "specialist";
  if (score >= 30) return "contributor";
  return "newcomer";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const authoredAnswers = and(
      eq(answers.authorId, userId),
      eq(answers.isHidden, false)
    );

    const [answerAggRow, aqsAggRow, questionCountRow, topCategoryRow, featuredAnswers] =
      await Promise.all([
        db
          .select({
            total: sql<number>`count(*)::int`,
            expert: sql<number>`count(*) filter (where ${answers.expertBadgeCount} > 0)::int`,
            accepted: sql<number>`count(*) filter (where ${answers.isAccepted} = true)::int`,
            helpfulSum: sql<number>`coalesce(sum(${answers.helpfulCount}), 0)::int`,
            expertBadgeSum: sql<number>`coalesce(sum(${answers.expertBadgeCount}), 0)::int`,
          })
          .from(answers)
          .where(authoredAnswers),

        db
          .select({
            avgAqs: sql<number>`coalesce(avg(${answerQualityMetrics.aqs}), 0)::int`,
            totalAqs: sql<number>`coalesce(sum(${answerQualityMetrics.aqs}), 0)::int`,
            starCount: sql<number>`count(*) filter (where ${answerQualityMetrics.label} = 'STAR')::int`,
            proCount: sql<number>`count(*) filter (where ${answerQualityMetrics.label} = 'PRO')::int`,
            usefulCount: sql<number>`count(*) filter (where ${answerQualityMetrics.label} = 'USEFUL')::int`,
          })
          .from(answerQualityMetrics)
          .innerJoin(answers, eq(answerQualityMetrics.answerId, answers.id))
          .where(authoredAnswers),

        db
          .select({ count: sql<number>`count(*)::int` })
          .from(questions)
          .where(and(eq(questions.authorId, userId), eq(questions.isHidden, false))),

        db
          .select({
            category: questions.category,
            count: sql<number>`count(*)::int`,
          })
          .from(answers)
          .innerJoin(questions, eq(answers.questionId, questions.id))
          .where(authoredAnswers)
          .groupBy(questions.category)
          .orderBy(desc(sql`count(*)`))
          .limit(1),

        db
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
          .limit(3),
      ]);

    const totalAnswers = answerAggRow[0]?.total ?? 0;
    const expertAnswers = answerAggRow[0]?.expert ?? 0;
    const acceptedAnswers = answerAggRow[0]?.accepted ?? 0;
    const helpfulReactions = answerAggRow[0]?.helpfulSum ?? 0;
    const expertReactionsCount = answerAggRow[0]?.expertBadgeSum ?? 0;

    const avgAqs = aqsAggRow[0]?.avgAqs ?? 0;
    const totalAqs = aqsAggRow[0]?.totalAqs ?? 0;
    const starCount = aqsAggRow[0]?.starCount ?? 0;
    const proCount = aqsAggRow[0]?.proCount ?? 0;
    const usefulCount = aqsAggRow[0]?.usefulCount ?? 0;

    const totalQuestions = questionCountRow[0]?.count ?? 0;
    const topCategory = topCategoryRow[0]?.category || null;

    const score =
      totalAnswers * 10 +
      acceptedAnswers * 50 +
      helpfulReactions * 5 +
      expertReactionsCount * 20 +
      totalQuestions * 2;

    return NextResponse.json({
      totalAnswers,
      expertAnswers,
      acceptedAnswers,
      topCategory,
      helpfulReactions,
      expertReactions: expertReactionsCount,
      totalQuestions,
      score,
      expertLevel: getExpertLevel(score),
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
