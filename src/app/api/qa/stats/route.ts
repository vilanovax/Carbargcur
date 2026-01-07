import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, users, userExpertiseStats } from "@/lib/db/schema";
import { eq, sql, and, gt, desc } from "drizzle-orm";

/**
 * GET /api/qa/stats - Get Q&A statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get counts
    const [questionsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(eq(questions.isHidden, false));

    const [answersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(answers)
      .where(eq(answers.isHidden, false));

    // Verified answers (with expert badge)
    const [verifiedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(answers)
      .where(
        and(
          eq(answers.isHidden, false),
          gt(answers.expertBadgeCount, 0)
        )
      );

    // Active experts (users with at least 1 answer)
    const [activeExperts] = await db
      .select({ count: sql<number>`count(DISTINCT ${answers.authorId})` })
      .from(answers)
      .where(eq(answers.isHidden, false));

    // Hot questions today (created in last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString();

    const [hotToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(
        and(
          eq(questions.isHidden, false),
          sql`${questions.createdAt} >= ${yesterdayIso}::timestamp`
        )
      );

    // Unanswered questions (last 24h)
    const unansweredQuestions = await db
      .select({
        id: questions.id,
        title: questions.title,
        category: questions.category,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .where(
        and(
          eq(questions.isHidden, false),
          eq(questions.answersCount, 0),
          sql`${questions.createdAt} >= ${yesterdayIso}::timestamp`
        )
      )
      .orderBy(desc(questions.createdAt))
      .limit(5);

    // Top active experts today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayIso = todayStart.toISOString();

    const topExperts = await db
      .select({
        userId: answers.authorId,
        answersToday: sql<number>`count(*)`,
      })
      .from(answers)
      .where(
        and(
          eq(answers.isHidden, false),
          sql`${answers.createdAt} >= ${todayIso}::timestamp`
        )
      )
      .groupBy(answers.authorId)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    // Get expert details with their expertise stats
    const expertDetails = await Promise.all(
      topExperts.map(async (expert) => {
        const [user] = await db
          .select({
            id: users.id,
            fullName: users.fullName,
          })
          .from(users)
          .where(eq(users.id, expert.userId))
          .limit(1);

        const [stats] = await db
          .select({
            expertLevel: userExpertiseStats.expertLevel,
            topCategory: userExpertiseStats.topCategory,
          })
          .from(userExpertiseStats)
          .where(eq(userExpertiseStats.userId, expert.userId))
          .limit(1);

        return {
          id: user?.id,
          fullName: user?.fullName || "کاربر",
          answersToday: Number(expert.answersToday),
          expertLevel: stats?.expertLevel || "newcomer",
          topCategory: stats?.topCategory,
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalQuestions: Number(questionsCount?.count || 0),
        totalAnswers: Number(answersCount?.count || 0),
        verifiedAnswers: Number(verifiedCount?.count || 0),
        activeExperts: Number(activeExperts?.count || 0),
        hotToday: Number(hotToday?.count || 0),
      },
      unansweredQuestions,
      topExperts: expertDetails.filter((e) => e.id),
    });
  } catch (error) {
    console.error("Error fetching Q&A stats:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آمار" },
      { status: 500 }
    );
  }
}
