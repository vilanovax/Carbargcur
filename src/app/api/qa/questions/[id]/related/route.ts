import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, users, profiles } from "@/lib/db/schema";
import { eq, and, ne, desc, sql, or, ilike } from "drizzle-orm";

/**
 * GET /api/qa/questions/[id]/related - Get related questions
 *
 * Algorithm:
 * 1. Same category (highest priority)
 * 2. Matching tags (medium priority)
 * 3. Similar keywords in title (lower priority)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // Get the current question
    const [currentQuestion] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!currentQuestion) {
      return NextResponse.json(
        { error: "سؤال یافت نشد" },
        { status: 404 }
      );
    }

    // Parse tags
    const currentTags: string[] = currentQuestion.tags
      ? JSON.parse(currentQuestion.tags)
      : [];

    // Extract keywords from title (simple approach: split by space, filter short words)
    const titleWords = currentQuestion.title
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 5); // Top 5 keywords

    // Build search conditions for related questions
    const relatedConditions = [
      eq(questions.isHidden, false),
      ne(questions.id, questionId),
    ];

    // Get questions from same category first
    const sameCategoryQuestions = await db
      .select({
        question: questions,
        author: {
          id: users.id,
          fullName: users.fullName,
        },
        authorProfile: {
          fullName: profiles.fullName,
        },
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(
        and(
          ...relatedConditions,
          eq(questions.category, currentQuestion.category)
        )
      )
      .orderBy(desc(questions.createdAt))
      .limit(limit * 2); // Get more to filter later

    // Calculate relevance score for each question
    const scoredQuestions = sameCategoryQuestions.map((q) => {
      let score = 10; // Base score for same category

      // Check tag overlap
      const qTags: string[] = q.question.tags
        ? JSON.parse(q.question.tags)
        : [];
      const tagOverlap = currentTags.filter((t) => qTags.includes(t)).length;
      score += tagOverlap * 5;

      // Check title keyword overlap
      const qTitleWords = q.question.title.toLowerCase().split(/\s+/);
      const keywordOverlap = titleWords.filter((word) =>
        qTitleWords.some((qWord) => qWord.includes(word.toLowerCase()))
      ).length;
      score += keywordOverlap * 3;

      // Bonus for answered questions
      if (q.question.answersCount > 0) {
        score += 2;
      }

      return {
        ...q,
        relevanceScore: score,
      };
    });

    // Sort by relevance score and take top N
    const topRelated = scoredQuestions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    // If we don't have enough from same category, get some from other categories
    // based on tag/keyword matching
    if (topRelated.length < limit && titleWords.length > 0) {
      const existingIds = topRelated.map((q) => q.question.id);

      // Build OR conditions for keyword search
      const keywordConditions = titleWords.map((word) =>
        ilike(questions.title, `%${word}%`)
      );

      const otherQuestions = await db
        .select({
          question: questions,
          author: {
            id: users.id,
            fullName: users.fullName,
          },
          authorProfile: {
            fullName: profiles.fullName,
          },
        })
        .from(questions)
        .leftJoin(users, eq(questions.authorId, users.id))
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(
          and(
            eq(questions.isHidden, false),
            ne(questions.id, questionId),
            ne(questions.category, currentQuestion.category),
            or(...keywordConditions)
          )
        )
        .orderBy(desc(questions.answersCount), desc(questions.createdAt))
        .limit(limit - topRelated.length);

      // Add with lower relevance score
      otherQuestions.forEach((q) => {
        if (!existingIds.includes(q.question.id)) {
          topRelated.push({
            ...q,
            relevanceScore: 5, // Lower score for different category
          });
        }
      });
    }

    return NextResponse.json({
      relatedQuestions: topRelated.slice(0, limit).map((q) => ({
        id: q.question.id,
        title: q.question.title,
        category: q.question.category,
        tags: q.question.tags ? JSON.parse(q.question.tags) : [],
        answersCount: q.question.answersCount,
        createdAt: q.question.createdAt,
        relevanceScore: q.relevanceScore,
        author: {
          id: q.author?.id,
          fullName: q.authorProfile?.fullName || q.author?.fullName || "کاربر",
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching related questions:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سؤالات مرتبط" },
      { status: 500 }
    );
  }
}
