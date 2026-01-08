import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, questions } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

/**
 * GET /api/users/[userId]/activity - Get user's Q&A activity for past 12 weeks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get activity for past 12 weeks
    const weeksAgo = 12;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeksAgo * 7);

    // Get weekly answer counts
    const answerActivity = await db
      .select({
        week: sql<string>`TO_CHAR(DATE_TRUNC('week', ${answers.createdAt}), 'YYYY-WW')`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(answers)
      .where(
        and(
          eq(answers.authorId, userId),
          eq(answers.isHidden, false),
          gte(answers.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE_TRUNC('week', ${answers.createdAt})`)
      .orderBy(sql`DATE_TRUNC('week', ${answers.createdAt})`);

    // Get weekly question counts
    const questionActivity = await db
      .select({
        week: sql<string>`TO_CHAR(DATE_TRUNC('week', ${questions.createdAt}), 'YYYY-WW')`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(questions)
      .where(
        and(
          eq(questions.authorId, userId),
          eq(questions.isHidden, false),
          gte(questions.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE_TRUNC('week', ${questions.createdAt})`)
      .orderBy(sql`DATE_TRUNC('week', ${questions.createdAt})`);

    // Build activity map for all 12 weeks
    const activityData: { week: string; answers: number; questions: number }[] = [];
    const now = new Date();

    for (let i = weeksAgo - 1; i >= 0; i--) {
      const weekDate = new Date(now);
      weekDate.setDate(weekDate.getDate() - i * 7);
      const weekKey = weekDate.toISOString().slice(0, 4) + '-' +
        String(Math.ceil((weekDate.getDate() + new Date(weekDate.getFullYear(), weekDate.getMonth(), 1).getDay()) / 7)).padStart(2, '0');

      // Find matching data or default to 0
      const answerData = answerActivity.find(a => a.week === weekKey);
      const questionData = questionActivity.find(q => q.week === weekKey);

      activityData.push({
        week: weekKey,
        answers: answerData?.count || 0,
        questions: questionData?.count || 0,
      });
    }

    return NextResponse.json({
      activity: activityData,
      totalWeeks: weeksAgo,
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      { error: "خطا در دریافت فعالیت کاربر" },
      { status: 500 }
    );
  }
}
