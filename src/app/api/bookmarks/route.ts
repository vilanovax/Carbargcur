import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questionBookmarks, questions, profiles, users } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth";
import { validateJson, validateQuery } from "@/lib/api/validate";
import { bookmarkCreateSchema, paginationQuery } from "@/lib/api/schemas";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const parsedQuery = validateQuery(new URL(request.url).searchParams, paginationQuery);
    if (parsedQuery instanceof NextResponse) return parsedQuery;
    const { limit, offset } = parsedQuery;

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
        authorName: profiles.fullName,
      })
      .from(questionBookmarks)
      .innerJoin(questions, eq(questionBookmarks.questionId, questions.id))
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          eq(questionBookmarks.userId, auth.userId),
          eq(questions.isHidden, false)
        )
      )
      .orderBy(desc(questionBookmarks.createdAt))
      .limit(limit)
      .offset(offset);

    const formattedBookmarks = bookmarks.map((b) => ({
      id: b.id,
      bookmarkedAt: b.bookmarkedAt,
      question: {
        ...b.question,
        tags: safeParseTags(b.question.tags),
        authorName: b.authorName || "کاربر",
      },
    }));

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questionBookmarks)
      .innerJoin(questions, eq(questionBookmarks.questionId, questions.id))
      .where(
        and(
          eq(questionBookmarks.userId, auth.userId),
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

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const parsed = await validateJson(request, bookmarkCreateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { questionId } = parsed;

    const [question] = await db
      .select({ id: questions.id })
      .from(questions)
      .where(and(eq(questions.id, questionId), eq(questions.isHidden, false)))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: "سؤال یافت نشد" }, { status: 404 });
    }

    const [existing] = await db
      .select({ id: questionBookmarks.id })
      .from(questionBookmarks)
      .where(
        and(
          eq(questionBookmarks.userId, auth.userId),
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

    const [bookmark] = await db
      .insert(questionBookmarks)
      .values({
        userId: auth.userId,
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

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "شناسه سؤال الزامی است" },
        { status: 400 }
      );
    }

    const result = await db
      .delete(questionBookmarks)
      .where(
        and(
          eq(questionBookmarks.userId, auth.userId),
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

function safeParseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
