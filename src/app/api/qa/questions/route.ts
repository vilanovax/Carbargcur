import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, users, profiles, userExpertiseStats, qaCategories, qaSettings } from "@/lib/db/schema";
import { eq, desc, and, sql, asc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to get active categories from DB
async function getActiveCategories() {
  const categories = await db
    .select()
    .from(qaCategories)
    .where(eq(qaCategories.isActive, true))
    .orderBy(asc(qaCategories.sortOrder));
  return categories.map((c) => ({ value: c.code, label: c.nameFa, icon: c.icon }));
}

// Helper to get QA setting
async function getQASetting(key: string): Promise<string | null> {
  const [setting] = await db
    .select()
    .from(qaSettings)
    .where(eq(qaSettings.key, key))
    .limit(1);
  return setting?.value || null;
}

/**
 * GET /api/qa/questions - List questions
 */
export async function GET(request: NextRequest) {
  try {
    // Check if QA is enabled
    const qaEnabled = await getQASetting("qa_enabled");
    if (qaEnabled === "false") {
      return NextResponse.json(
        { error: "بخش پرسش و پاسخ غیرفعال است", disabled: true },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const myExpertiseOnly = searchParams.get("myExpertise") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [eq(questions.isHidden, false)];
    if (category) {
      conditions.push(eq(questions.category, category));
    }

    // Filter by user's expertise if requested and user is logged in
    let userExpertiseCategories: string[] = [];
    if (myExpertiseOnly) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        // Get user's top category from their stats
        const [userStats] = await db
          .select({ topCategory: userExpertiseStats.topCategory })
          .from(userExpertiseStats)
          .where(eq(userExpertiseStats.userId, session.user.id))
          .limit(1);

        if (userStats?.topCategory) {
          userExpertiseCategories = [userStats.topCategory];
          conditions.push(eq(questions.category, userStats.topCategory));
        }
      }
    }

    // Get questions with author info
    const questionsData = await db
      .select({
        question: questions,
        author: {
          id: users.id,
          fullName: users.fullName,
        },
        authorProfile: {
          fullName: profiles.fullName,
          profilePhotoUrl: profiles.profilePhotoUrl,
          experienceLevel: profiles.experienceLevel,
        },
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(questions.createdAt))
      .limit(limit)
      .offset(offset);

    // Filter by tag if provided
    let filteredQuestions = questionsData;
    if (tag) {
      filteredQuestions = questionsData.filter((q) => {
        const tags = q.question.tags ? JSON.parse(q.question.tags) : [];
        return tags.includes(tag);
      });
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(and(...conditions));

    const totalCount = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      questions: filteredQuestions.map((q) => ({
        id: q.question.id,
        title: q.question.title,
        body: q.question.body.substring(0, 200) + (q.question.body.length > 200 ? "..." : ""),
        category: q.question.category,
        tags: q.question.tags ? JSON.parse(q.question.tags) : [],
        answersCount: q.question.answersCount,
        createdAt: q.question.createdAt,
        author: {
          id: q.author?.id,
          fullName: q.authorProfile?.fullName || q.author?.fullName || "کاربر",
          profilePhotoUrl: q.authorProfile?.profilePhotoUrl,
          experienceLevel: q.authorProfile?.experienceLevel,
        },
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      categories: await getActiveCategories(),
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سؤالات" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/qa/questions - Create new question
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const { title, body: questionBody, category, tags } = body;

    // Validate required fields
    if (!title?.trim() || !questionBody?.trim() || !category) {
      return NextResponse.json(
        { error: "عنوان، متن و دسته‌بندی الزامی است" },
        { status: 400 }
      );
    }

    // Validate category
    const activeCategories = await getActiveCategories();
    const validCategories = activeCategories.map((c) => c.value);
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "دسته‌بندی نامعتبر یا غیرفعال است" },
        { status: 400 }
      );
    }

    // Validate tags (max 3)
    const parsedTags = Array.isArray(tags) ? tags.slice(0, 3) : [];

    // Rate limiting: Check how many questions user asked today
    const dailyLimit = parseInt(await getQASetting("daily_question_limit") || "5");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const userQuestionsToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(
        and(
          eq(questions.authorId, session.user.id),
          sql`${questions.createdAt} >= ${todayIso}::timestamp`
        )
      );

    if (Number(userQuestionsToday[0]?.count || 0) >= dailyLimit) {
      return NextResponse.json(
        { error: `شما امروز به حداکثر تعداد سؤال رسیده‌اید (${dailyLimit} سؤال)` },
        { status: 429 }
      );
    }

    // Create question
    const [newQuestion] = await db
      .insert(questions)
      .values({
        authorId: session.user.id,
        title: title.trim(),
        body: questionBody.trim(),
        category,
        tags: parsedTags.length > 0 ? JSON.stringify(parsedTags) : null,
      })
      .returning();

    // Update user expertise stats
    await updateExpertiseStats(session.user.id, "question");

    return NextResponse.json(
      {
        question: {
          id: newQuestion.id,
          title: newQuestion.title,
          category: newQuestion.category,
        },
        message: "سؤال با موفقیت ثبت شد",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "خطا در ثبت سؤال" },
      { status: 500 }
    );
  }
}

// Helper function to update expertise stats
async function updateExpertiseStats(userId: string, action: "question" | "answer") {
  try {
    const [existing] = await db
      .select()
      .from(userExpertiseStats)
      .where(eq(userExpertiseStats.userId, userId))
      .limit(1);

    if (existing) {
      await db
        .update(userExpertiseStats)
        .set({
          totalQuestions: action === "question"
            ? sql`${userExpertiseStats.totalQuestions} + 1`
            : existing.totalQuestions,
          totalAnswers: action === "answer"
            ? sql`${userExpertiseStats.totalAnswers} + 1`
            : existing.totalAnswers,
          updatedAt: new Date(),
        })
        .where(eq(userExpertiseStats.userId, userId));
    } else {
      await db.insert(userExpertiseStats).values({
        userId,
        totalQuestions: action === "question" ? 1 : 0,
        totalAnswers: action === "answer" ? 1 : 0,
      });
    }
  } catch (error) {
    console.error("Error updating expertise stats:", error);
  }
}
