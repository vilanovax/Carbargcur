import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questionBookmarks, questions, profiles, users } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/bookmarks - Get user's bookmarked questions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get bookmarked questions with author info
    const bookmarks = await db
      .select({
        id: questionBookmarks.id,
        bookmarkedAt: questionBookmarks.createdAt,
        question: {
          id: questions.id,
          title: questions.title,
          body: questions.body,
          category: questions.category,
          tags: questions.tags,
          answersCount: questions.answersCount,
          createdAt: questions.createdAt,
          authorId: questions.authorId,
        },
      })
      .from(questionBookmarks)
      .innerJoin(questions, eq(questionBookmarks.questionId, questions.id))
      .where(
        and(
          eq(questionBookmarks.userId, session.user.id),
          eq(questions.isHidden, false)
        )
      )
      .orderBy(desc(questionBookmarks.createdAt))
      .limit(limit)
      .offset(offset);

    // Get author names for bookmarked questions
    const authorIds = [...new Set(bookmarks.map((b) => b.question.authorId))];
    const authors = authorIds.length > 0
      ? await db
          .select({
            id: users.id,
            fullName: profiles.fullName,
          })
          .from(users)
          .leftJoin(profiles, eq(users.id, profiles.userId))
          .where(sql`${users.id} IN ${authorIds}`)
      : [];

    const authorMap = new Map(authors.map((a) => [a.id, a.fullName]));

    // Format response
    const formattedBookmarks = bookmarks.map((b) => ({
      id: b.id,
      bookmarkedAt: b.bookmarkedAt,
      question: {
        ...b.question,
        tags: b.question.tags ? JSON.parse(b.question.tags) : [],
        authorName: authorMap.get(b.question.authorId) || "کاربر",
      },
    }));

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questionBookmarks)
      .innerJoin(questions, eq(questionBookmarks.questionId, questions.id))
      .where(
        and(
          eq(questionBookmarks.userId, session.user.id),
          eq(questions.isHidden, false)
        )
      );

    return NextResponse.json({
      bookmarks: formattedBookmarks,
      total: Number(countResult?.count || 0),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "خطا در دریافت نشان‌گذاری‌ها" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookmarks - Add a bookmark
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const { questionId } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: "شناسه سؤال الزامی است" },
        { status: 400 }
      );
    }

    // Check if question exists
    const [question] = await db
      .select({ id: questions.id })
      .from(questions)
      .where(and(eq(questions.id, questionId), eq(questions.isHidden, false)))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: "سؤال یافت نشد" }, { status: 404 });
    }

    // Check if already bookmarked
    const [existing] = await db
      .select({ id: questionBookmarks.id })
      .from(questionBookmarks)
      .where(
        and(
          eq(questionBookmarks.userId, session.user.id),
          eq(questionBookmarks.questionId, questionId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "این سؤال قبلاً نشان‌گذاری شده است", alreadyBookmarked: true },
        { status: 400 }
      );
    }

    // Add bookmark
    const [bookmark] = await db
      .insert(questionBookmarks)
      .values({
        userId: session.user.id,
        questionId,
      })
      .returning();

    return NextResponse.json(
      {
        bookmark: {
          id: bookmark.id,
          questionId: bookmark.questionId,
          createdAt: bookmark.createdAt,
        },
        message: "سؤال نشان‌گذاری شد",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return NextResponse.json(
      { error: "خطا در نشان‌گذاری سؤال" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookmarks - Remove a bookmark
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "شناسه سؤال الزامی است" },
        { status: 400 }
      );
    }

    // Delete bookmark
    const result = await db
      .delete(questionBookmarks)
      .where(
        and(
          eq(questionBookmarks.userId, session.user.id),
          eq(questionBookmarks.questionId, questionId)
        )
      )
      .returning({ id: questionBookmarks.id });

    if (result.length === 0) {
      return NextResponse.json(
        { error: "نشان‌گذاری یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "نشان‌گذاری حذف شد",
    });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return NextResponse.json(
      { error: "خطا در حذف نشان‌گذاری" },
      { status: 500 }
    );
  }
}
