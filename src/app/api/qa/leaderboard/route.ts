import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, users, profiles, answerQualityMetrics, questions, qaCategories } from "@/lib/db/schema";
import { eq, sql, desc, and, gte, asc } from "drizzle-orm";

/**
 * GET /api/qa/leaderboard
 * Get top experts based on AQS metrics
 *
 * Query params:
 * - period: "all" | "month" | "week" (default: "all")
 * - category: string (optional, filter by category)
 * - limit: number (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";
    const category = searchParams.get("category");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    // Calculate date filter based on period
    let dateFilter = undefined;
    const now = new Date();
    if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = gte(answers.createdAt, weekAgo);
    } else if (period === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = gte(answers.createdAt, monthAgo);
    }

    // Build where conditions
    const conditions = [eq(answers.isHidden, false)];
    if (dateFilter) {
      conditions.push(dateFilter);
    }

    // Category filter requires joining with questions table
    const whereConditions = and(...conditions);

    // Build the query - if category filter, we need to join questions
    let leaderboardData;

    if (category) {
      // With category filter
      leaderboardData = await db
        .select({
          userId: answers.authorId,
          userName: users.fullName,
          profileFullName: profiles.fullName,
          profilePhotoUrl: profiles.profilePhotoUrl,
          currentPosition: profiles.currentPosition,
          experienceLevel: profiles.experienceLevel,
          totalAnswers: sql<number>`count(${answers.id})::int`,
          acceptedAnswers: sql<number>`count(case when ${answers.isAccepted} then 1 end)::int`,
          avgAqs: sql<number>`coalesce(avg(${answerQualityMetrics.aqs}), 0)::int`,
          totalAqs: sql<number>`coalesce(sum(${answerQualityMetrics.aqs}), 0)::int`,
          starCount: sql<number>`count(case when ${answerQualityMetrics.label} = 'STAR' then 1 end)::int`,
          proCount: sql<number>`count(case when ${answerQualityMetrics.label} = 'PRO' then 1 end)::int`,
          usefulCount: sql<number>`count(case when ${answerQualityMetrics.label} = 'USEFUL' then 1 end)::int`,
          helpfulCount: sql<number>`coalesce(sum(${answers.helpfulCount}), 0)::int`,
        })
        .from(answers)
        .innerJoin(questions, eq(answers.questionId, questions.id))
        .leftJoin(users, eq(answers.authorId, users.id))
        .leftJoin(profiles, eq(profiles.userId, answers.authorId))
        .leftJoin(answerQualityMetrics, eq(answers.id, answerQualityMetrics.answerId))
        .where(and(whereConditions, eq(questions.category, category)))
        .groupBy(
          answers.authorId,
          users.fullName,
          profiles.fullName,
          profiles.profilePhotoUrl,
          profiles.currentPosition,
          profiles.experienceLevel
        )
        .having(sql`count(${answers.id}) >= 1`)
        .orderBy(
          desc(sql`coalesce(avg(${answerQualityMetrics.aqs}), 0)`),
          desc(sql`count(case when ${answers.isAccepted} then 1 end)`),
          desc(sql`count(${answers.id})`)
        )
        .limit(limit);
    } else {
      // Without category filter (existing query)
      leaderboardData = await db
        .select({
          userId: answers.authorId,
          userName: users.fullName,
          profileFullName: profiles.fullName,
          profilePhotoUrl: profiles.profilePhotoUrl,
          currentPosition: profiles.currentPosition,
          experienceLevel: profiles.experienceLevel,
          totalAnswers: sql<number>`count(${answers.id})::int`,
          acceptedAnswers: sql<number>`count(case when ${answers.isAccepted} then 1 end)::int`,
          avgAqs: sql<number>`coalesce(avg(${answerQualityMetrics.aqs}), 0)::int`,
          totalAqs: sql<number>`coalesce(sum(${answerQualityMetrics.aqs}), 0)::int`,
          starCount: sql<number>`count(case when ${answerQualityMetrics.label} = 'STAR' then 1 end)::int`,
          proCount: sql<number>`count(case when ${answerQualityMetrics.label} = 'PRO' then 1 end)::int`,
          usefulCount: sql<number>`count(case when ${answerQualityMetrics.label} = 'USEFUL' then 1 end)::int`,
          helpfulCount: sql<number>`coalesce(sum(${answers.helpfulCount}), 0)::int`,
        })
        .from(answers)
        .leftJoin(users, eq(answers.authorId, users.id))
        .leftJoin(profiles, eq(profiles.userId, answers.authorId))
        .leftJoin(answerQualityMetrics, eq(answers.id, answerQualityMetrics.answerId))
        .where(whereConditions)
        .groupBy(
          answers.authorId,
          users.fullName,
          profiles.fullName,
          profiles.profilePhotoUrl,
          profiles.currentPosition,
          profiles.experienceLevel
        )
        .having(sql`count(${answers.id}) >= 1`)
        .orderBy(
          desc(sql`coalesce(avg(${answerQualityMetrics.aqs}), 0)`),
          desc(sql`count(case when ${answers.isAccepted} then 1 end)`),
          desc(sql`count(${answers.id})`)
        )
        .limit(limit);
    }

    // Get available categories
    const categories = await db
      .select()
      .from(qaCategories)
      .where(eq(qaCategories.isActive, true))
      .orderBy(asc(qaCategories.sortOrder));

    // Format response
    const experts = leaderboardData.map((expert, index) => ({
      rank: index + 1,
      userId: expert.userId,
      name: expert.profileFullName || expert.userName || "کاربر",
      profilePhotoUrl: expert.profilePhotoUrl,
      currentPosition: expert.currentPosition,
      experienceLevel: expert.experienceLevel,
      stats: {
        totalAnswers: expert.totalAnswers,
        acceptedAnswers: expert.acceptedAnswers,
        acceptanceRate: expert.totalAnswers > 0
          ? Math.round((expert.acceptedAnswers / expert.totalAnswers) * 100)
          : 0,
        avgAqs: expert.avgAqs,
        totalAqs: expert.totalAqs,
        starCount: expert.starCount,
        proCount: expert.proCount,
        usefulCount: expert.usefulCount,
        helpfulCount: expert.helpfulCount,
      },
      // Calculate expert score (weighted formula)
      score: Math.round(
        expert.avgAqs * 0.4 +
        (expert.acceptedAnswers / Math.max(expert.totalAnswers, 1)) * 100 * 0.3 +
        Math.min(expert.totalAnswers * 2, 30) * 0.3
      ),
    }));

    // Sort by score
    experts.sort((a, b) => b.score - a.score);
    experts.forEach((e, i) => e.rank = i + 1);

    return NextResponse.json({
      experts,
      period,
      category: category || null,
      totalExperts: experts.length,
      categories: categories.map((c) => ({
        code: c.code,
        name: c.nameFa,
        icon: c.icon,
      })),
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیدربورد" },
      { status: 500 }
    );
  }
}
