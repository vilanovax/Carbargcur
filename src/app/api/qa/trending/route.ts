import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, users, profiles, questionEngagement, answerReactions } from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

/**
 * Trending Algorithm:
 * trendingScore = (views × 1) + (answers × 10) + (reactions × 5) + recencyBoost
 *
 * Recency boost multiplier:
 * - Last 24 hours: 2.0x
 * - Last 7 days: 1.5x
 * - Last 30 days: 1.0x
 *
 * Only questions from the last 30 days are considered.
 */

interface TrendingQuestion {
  id: string;
  title: string;
  category: string;
  answersCount: number;
  viewsCount: number;
  reactionsCount: number;
  trendingScore: number;
  createdAt: Date;
  author: {
    fullName: string;
  };
}

/**
 * GET /api/qa/trending - Get trending questions
 * Query params:
 * - limit: number of questions (default 5, max 20)
 * - period: 'day' | 'week' | 'month' (default 'week')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 20);
    const period = searchParams.get("period") || "week";

    // Calculate date thresholds
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Determine the date filter based on period
    let dateThreshold: Date;
    switch (period) {
      case "day":
        dateThreshold = oneDayAgo;
        break;
      case "month":
        dateThreshold = oneMonthAgo;
        break;
      case "week":
      default:
        dateThreshold = oneWeekAgo;
        break;
    }

    // Get questions with engagement data
    const questionsWithEngagement = await db
      .select({
        question: questions,
        author: {
          fullName: users.fullName,
        },
        authorProfile: {
          fullName: profiles.fullName,
        },
        viewsCount: questionEngagement.viewsCount,
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .leftJoin(questionEngagement, eq(questions.id, questionEngagement.questionId))
      .where(
        and(
          eq(questions.isHidden, false),
          gte(questions.createdAt, dateThreshold)
        )
      )
      .orderBy(desc(questions.createdAt))
      .limit(100); // Get more to calculate trending scores

    if (questionsWithEngagement.length === 0) {
      return NextResponse.json({
        trending: [],
        period,
      });
    }

    // Get reaction counts for all questions (sum of reactions on answers)
    const questionIds = questionsWithEngagement.map((q) => q.question.id);

    // Get answers for these questions
    const answersForQuestions = await db
      .select({
        questionId: answers.questionId,
        answerId: answers.id,
      })
      .from(answers)
      .where(
        and(
          eq(answers.isHidden, false),
          sql`${answers.questionId} IN (${sql.join(
            questionIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      );

    // Get reactions for those answers
    const answerIds = answersForQuestions.map((a) => a.answerId);
    let reactionsByQuestion: Record<string, number> = {};

    if (answerIds.length > 0) {
      const reactions = await db
        .select({
          answerId: answerReactions.answerId,
          count: sql<number>`count(*)`,
        })
        .from(answerReactions)
        .where(
          sql`${answerReactions.answerId} IN (${sql.join(
            answerIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
        .groupBy(answerReactions.answerId);

      // Map reactions to questions
      const answerToQuestion = answersForQuestions.reduce(
        (acc, a) => ({ ...acc, [a.answerId]: a.questionId }),
        {} as Record<string, string>
      );

      reactions.forEach((r) => {
        const questionId = answerToQuestion[r.answerId];
        if (questionId) {
          reactionsByQuestion[questionId] =
            (reactionsByQuestion[questionId] || 0) + Number(r.count);
        }
      });
    }

    // Calculate trending scores
    const trendingQuestions: TrendingQuestion[] = questionsWithEngagement.map((q) => {
      const viewsCount = q.viewsCount || 0;
      const answersCount = q.question.answersCount;
      const reactionsCount = reactionsByQuestion[q.question.id] || 0;

      // Calculate recency boost
      const questionAge = now.getTime() - new Date(q.question.createdAt).getTime();
      const hoursOld = questionAge / (1000 * 60 * 60);

      let recencyMultiplier = 1.0;
      if (hoursOld <= 24) {
        recencyMultiplier = 2.0;
      } else if (hoursOld <= 24 * 7) {
        recencyMultiplier = 1.5;
      }

      // Calculate trending score
      const baseScore = viewsCount * 1 + answersCount * 10 + reactionsCount * 5;
      const trendingScore = Math.round(baseScore * recencyMultiplier);

      return {
        id: q.question.id,
        title: q.question.title,
        category: q.question.category,
        answersCount,
        viewsCount,
        reactionsCount,
        trendingScore,
        createdAt: q.question.createdAt,
        author: {
          fullName: q.authorProfile?.fullName || q.author?.fullName || "کاربر",
        },
      };
    });

    // Sort by trending score and take top N
    const sortedTrending = trendingQuestions
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    return NextResponse.json({
      trending: sortedTrending,
      period,
    });
  } catch (error) {
    console.error("Error fetching trending questions:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سؤالات داغ" },
      { status: 500 }
    );
  }
}
