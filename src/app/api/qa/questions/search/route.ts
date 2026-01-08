import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq, desc, or, ilike, and } from "drizzle-orm";

/**
 * GET /api/qa/questions/search - Search questions by title
 * Used for "similar questions" suggestions while typing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!query || query.length < 3) {
      return NextResponse.json({ questions: [] });
    }

    // Build search conditions
    const conditions = [eq(questions.isHidden, false)];

    // Search in title
    const searchPattern = `%${query}%`;
    conditions.push(ilike(questions.title, searchPattern));

    // Filter by category if provided
    if (category) {
      conditions.push(eq(questions.category, category));
    }

    const results = await db
      .select({
        id: questions.id,
        title: questions.title,
        category: questions.category,
        answersCount: questions.answersCount,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .where(and(...conditions))
      .orderBy(desc(questions.answersCount), desc(questions.createdAt))
      .limit(limit);

    return NextResponse.json({
      questions: results.map((q) => ({
        id: q.id,
        title: q.title,
        category: q.category,
        answersCount: q.answersCount,
        hasAnswer: q.answersCount > 0,
      })),
    });
  } catch (error) {
    console.error("Error searching questions:", error);
    return NextResponse.json(
      { error: "خطا در جستجو" },
      { status: 500 }
    );
  }
}
