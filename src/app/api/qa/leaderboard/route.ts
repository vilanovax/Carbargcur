import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * GET /api/qa/leaderboard - Get Q&A leaderboard
 * Query params:
 * - period: "all" | "week" | "month" (default: "all")
 * - category: category code filter (optional)
 * - limit: number of results (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "all";
    const category = searchParams.get("category");
    const limitParam = parseInt(searchParams.get("limit") || "20");
    const limit = Math.min(Math.max(1, limitParam), 100);

    // Build date filter based on period
    let dateFilter = "";
    if (period === "week") {
      dateFilter = "AND a.created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === "month") {
      dateFilter = "AND a.created_at >= NOW() - INTERVAL '30 days'";
    }

    // Build category filter
    let categoryFilter = "";
    let categoryJoin = "";
    if (category) {
      categoryJoin = "JOIN questions q ON a.question_id = q.id";
      categoryFilter = "AND q.category = '" + category + "'";
    }

    // Build question date filter
    let questionDateFilter = "";
    if (period === "week") {
      questionDateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === "month") {
      questionDateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
    }

    let questionCategoryFilter = "";
    if (category) {
      questionCategoryFilter = "AND category = '" + category + "'";
    }

    // Get leaderboard with calculated scores
    const query = `
      WITH answer_stats AS (
        SELECT
          a.author_id,
          COUNT(DISTINCT a.id) as total_answers,
          COUNT(DISTINCT a.id) FILTER (WHERE a.is_accepted = true) as accepted_answers,
          COALESCE(SUM(a.helpful_count), 0) as helpful_reactions,
          COALESCE(SUM(a.expert_badge_count), 0) as expert_reactions
        FROM answers a
        ${categoryJoin}
        WHERE a.is_hidden = false ${dateFilter} ${categoryFilter}
        GROUP BY a.author_id
        HAVING COUNT(DISTINCT a.id) >= 1
      ),
      question_stats AS (
        SELECT
          author_id,
          COUNT(*) as total_questions
        FROM questions
        WHERE is_hidden = false ${questionDateFilter} ${questionCategoryFilter}
        GROUP BY author_id
      ),
      combined_stats AS (
        SELECT
          COALESCE(ans.author_id, qs.author_id) as user_id,
          COALESCE(ans.total_answers, 0) as total_answers,
          COALESCE(ans.accepted_answers, 0) as accepted_answers,
          COALESCE(ans.helpful_reactions, 0) as helpful_reactions,
          COALESCE(ans.expert_reactions, 0) as expert_reactions,
          COALESCE(qs.total_questions, 0) as total_questions,
          (COALESCE(ans.total_answers, 0) * 10 +
           COALESCE(ans.accepted_answers, 0) * 50 +
           COALESCE(ans.helpful_reactions, 0) * 5 +
           COALESCE(ans.expert_reactions, 0) * 20 +
           COALESCE(qs.total_questions, 0) * 2) as score
        FROM answer_stats ans
        FULL OUTER JOIN question_stats qs ON ans.author_id = qs.author_id
      )
      SELECT
        cs.user_id,
        cs.total_answers,
        cs.accepted_answers,
        cs.helpful_reactions,
        cs.expert_reactions,
        cs.total_questions,
        cs.score,
        p.full_name,
        p.slug,
        p.profile_photo_url,
        p.current_position,
        p.city,
        ues.expert_level,
        ues.top_category
      FROM combined_stats cs
      JOIN profiles p ON cs.user_id = p.user_id
      LEFT JOIN user_expertise_stats ues ON cs.user_id = ues.user_id
      WHERE p.is_active = true
      ORDER BY cs.score DESC
      LIMIT ${limit}
    `;

    const leaderboardResult = await db.execute(sql.raw(query));

    // Handle Drizzle result format
    const resultArray = Array.isArray(leaderboardResult)
      ? leaderboardResult
      : ((leaderboardResult as { rows?: unknown[] }).rows || []);

    // Add rank to results
    const leaderboard = resultArray.map((row: any, index: number) => ({
      rank: index + 1,
      userId: row.user_id,
      fullName: row.full_name,
      slug: row.slug,
      profilePhotoUrl: row.profile_photo_url,
      currentPosition: row.current_position,
      city: row.city,
      expertLevel: row.expert_level || "newcomer",
      topCategory: row.top_category,
      stats: {
        totalAnswers: Number(row.total_answers || 0),
        acceptedAnswers: Number(row.accepted_answers || 0),
        helpfulReactions: Number(row.helpful_reactions || 0),
        expertReactions: Number(row.expert_reactions || 0),
        totalQuestions: Number(row.total_questions || 0),
        score: Number(row.score || 0),
      },
    }));

    return NextResponse.json({
      leaderboard,
      period,
      category: category || null,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیدربورد" },
      { status: 500 }
    );
  }
}
