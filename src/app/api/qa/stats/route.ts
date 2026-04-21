import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, users, userExpertiseStats, questionEngagement } from "@/lib/db/schema";
import { eq, sql, and, gt, gte, desc, inArray } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayIso = todayStart.toISOString();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoIso = oneWeekAgo.toISOString();

    const [
      questionsAgg,
      answersAgg,
      hotTodayRow,
      unansweredQuestions,
      topExperts,
      trendingCandidates,
    ] = await Promise.all([
      db
        .select({
          total: sql<number>`count(*)::int`,
          hotToday: sql<number>`count(*) filter (where ${questions.createdAt} >= ${yesterdayIso}::timestamp)::int`,
        })
        .from(questions)
        .where(eq(questions.isHidden, false)),

      db
        .select({
          total: sql<number>`count(*)::int`,
          verified: sql<number>`count(*) filter (where ${answers.expertBadgeCount} > 0)::int`,
          activeExperts: sql<number>`count(distinct ${answers.authorId})::int`,
        })
        .from(answers)
        .where(eq(answers.isHidden, false)),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(questions)
        .where(
          and(
            eq(questions.isHidden, false),
            sql`${questions.createdAt} >= ${yesterdayIso}::timestamp`
          )
        ),

      db
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
        .limit(5),

      db
        .select({
          userId: answers.authorId,
          answersToday: sql<number>`count(*)::int`,
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
        .limit(5),

      db
        .select({
          question: questions,
          viewsCount: questionEngagement.viewsCount,
        })
        .from(questions)
        .leftJoin(questionEngagement, eq(questions.id, questionEngagement.questionId))
        .where(
          and(
            eq(questions.isHidden, false),
            gte(questions.createdAt, sql`${oneWeekAgoIso}::timestamp`)
          )
        )
        .orderBy(desc(questions.createdAt))
        .limit(50),
    ]);

    const expertIds = topExperts.map((e) => e.userId);
    const [expertUsers, expertStats] = expertIds.length
      ? await Promise.all([
          db
            .select({ id: users.id, fullName: users.fullName })
            .from(users)
            .where(inArray(users.id, expertIds)),
          db
            .select({
              userId: userExpertiseStats.userId,
              expertLevel: userExpertiseStats.expertLevel,
              topCategory: userExpertiseStats.topCategory,
            })
            .from(userExpertiseStats)
            .where(inArray(userExpertiseStats.userId, expertIds)),
        ])
      : [[], []];

    const userById = new Map(expertUsers.map((u) => [u.id, u]));
    const statsByUser = new Map(expertStats.map((s) => [s.userId, s]));

    const expertDetails = topExperts
      .map((expert) => {
        const user = userById.get(expert.userId);
        const stats = statsByUser.get(expert.userId);
        if (!user) return null;
        return {
          id: user.id,
          fullName: user.fullName || "کاربر",
          answersToday: expert.answersToday,
          expertLevel: stats?.expertLevel || "newcomer",
          topCategory: stats?.topCategory,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    const now = new Date();
    const trendingQuestions = trendingCandidates
      .map((q) => {
        const viewsCount = q.viewsCount || 0;
        const answersCount = q.question.answersCount;
        const hoursOld =
          (now.getTime() - new Date(q.question.createdAt).getTime()) / (1000 * 60 * 60);
        const recencyMultiplier = hoursOld <= 24 ? 2.0 : hoursOld <= 72 ? 1.5 : 1.0;
        const score = Math.round((viewsCount * 1 + answersCount * 10) * recencyMultiplier);
        return {
          id: q.question.id,
          title: q.question.title,
          category: q.question.category,
          answersCount,
          viewsCount,
          trendingScore: score,
          createdAt: q.question.createdAt,
        };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 5);

    return NextResponse.json(
      {
        stats: {
          totalQuestions: questionsAgg[0]?.total ?? 0,
          totalAnswers: answersAgg[0]?.total ?? 0,
          verifiedAnswers: answersAgg[0]?.verified ?? 0,
          activeExperts: answersAgg[0]?.activeExperts ?? 0,
          hotToday: hotTodayRow[0]?.count ?? 0,
        },
        unansweredQuestions,
        trendingQuestions,
        topExperts: expertDetails,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching Q&A stats:", error);
    return NextResponse.json({ error: "خطا در دریافت آمار" }, { status: 500 });
  }
}
