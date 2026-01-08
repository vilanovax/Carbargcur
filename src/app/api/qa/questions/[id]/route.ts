import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, users, profiles, answerQualityMetrics, answerReactions, questionEngagement } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/qa/questions/[id] - Get question detail with answers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get question with author info
    const [questionData] = await db
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
          currentPosition: profiles.currentPosition,
        },
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(and(eq(questions.id, id), eq(questions.isHidden, false)))
      .limit(1);

    if (!questionData) {
      return NextResponse.json(
        { error: "سؤال یافت نشد" },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget - don't block response)
    (async () => {
      try {
        // Upsert view count
        await db
          .insert(questionEngagement)
          .values({
            questionId: id,
            viewsCount: 1,
          })
          .onConflictDoUpdate({
            target: questionEngagement.questionId,
            set: {
              viewsCount: sql`${questionEngagement.viewsCount} + 1`,
              updatedAt: new Date(),
            },
          });
      } catch (err) {
        console.error("Error tracking view:", err);
      }
    })();

    // Get answers with author info and quality metrics
    // Sort by: isAccepted DESC, AQS DESC, createdAt DESC
    const answersData = await db
      .select({
        answer: answers,
        author: {
          id: users.id,
          fullName: users.fullName,
        },
        authorProfile: {
          fullName: profiles.fullName,
          profilePhotoUrl: profiles.profilePhotoUrl,
          experienceLevel: profiles.experienceLevel,
          currentPosition: profiles.currentPosition,
        },
        quality: {
          aqs: answerQualityMetrics.aqs,
          label: answerQualityMetrics.label,
        },
      })
      .from(answers)
      .leftJoin(users, eq(answers.authorId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .leftJoin(answerQualityMetrics, eq(answers.id, answerQualityMetrics.answerId))
      .where(and(eq(answers.questionId, id), eq(answers.isHidden, false)))
      .orderBy(
        desc(answers.isAccepted),
        desc(answerQualityMetrics.aqs),
        desc(answers.createdAt)
      );

    // Get current user's reactions (if logged in)
    let userReactions: Record<string, string> = {};
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const reactions = await db
        .select()
        .from(answerReactions)
        .where(eq(answerReactions.userId, session.user.id));

      userReactions = reactions.reduce(
        (acc, r) => ({ ...acc, [r.answerId]: r.type }),
        {}
      );
    }

    return NextResponse.json({
      question: {
        id: questionData.question.id,
        title: questionData.question.title,
        body: questionData.question.body,
        category: questionData.question.category,
        tags: questionData.question.tags ? JSON.parse(questionData.question.tags) : [],
        answersCount: questionData.question.answersCount,
        createdAt: questionData.question.createdAt,
        author: {
          id: questionData.author?.id,
          fullName: questionData.authorProfile?.fullName || questionData.author?.fullName || "کاربر",
          profilePhotoUrl: questionData.authorProfile?.profilePhotoUrl,
          experienceLevel: questionData.authorProfile?.experienceLevel,
          currentPosition: questionData.authorProfile?.currentPosition,
        },
      },
      answers: answersData.map((a) => ({
        id: a.answer.id,
        body: a.answer.body,
        helpfulCount: a.answer.helpfulCount,
        expertBadgeCount: a.answer.expertBadgeCount,
        isAccepted: a.answer.isAccepted,
        acceptedAt: a.answer.acceptedAt,
        createdAt: a.answer.createdAt,
        userReaction: userReactions[a.answer.id] || null,
        // Quality metrics
        aqs: a.quality?.aqs ?? 0,
        qualityLabel: a.quality?.label ?? "NORMAL",
        author: {
          id: a.author?.id,
          fullName: a.authorProfile?.fullName || a.author?.fullName || "کاربر",
          profilePhotoUrl: a.authorProfile?.profilePhotoUrl,
          experienceLevel: a.authorProfile?.experienceLevel,
          currentPosition: a.authorProfile?.currentPosition,
        },
      })),
      // Add isAsker flag for UI
      isAsker: session?.user?.id === questionData.question.authorId,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سؤال" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/qa/questions/[id]
 * Edit a question (only by author, only within 24 hours)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id: questionId } = await params;
    const body = await request.json();
    const { title, body: questionBody } = body;

    // Validate input
    if (!title || typeof title !== "string" || title.trim().length < 10) {
      return NextResponse.json(
        { error: "عنوان سؤال باید حداقل ۱۰ کاراکتر باشد" },
        { status: 400 }
      );
    }

    if (!questionBody || typeof questionBody !== "string" || questionBody.trim().length < 30) {
      return NextResponse.json(
        { error: "متن سؤال باید حداقل ۳۰ کاراکتر باشد" },
        { status: 400 }
      );
    }

    if (title.trim().length > 200) {
      return NextResponse.json(
        { error: "عنوان سؤال نمی‌تواند بیش از ۲۰۰ کاراکتر باشد" },
        { status: 400 }
      );
    }

    if (questionBody.trim().length > 5000) {
      return NextResponse.json(
        { error: "متن سؤال نمی‌تواند بیش از ۵۰۰۰ کاراکتر باشد" },
        { status: 400 }
      );
    }

    // Get question
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: "سؤال یافت نشد" }, { status: 404 });
    }

    // Check ownership
    if (question.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "فقط نویسنده می‌تواند سؤال را ویرایش کند" },
        { status: 403 }
      );
    }

    // Check if hidden
    if (question.isHidden) {
      return NextResponse.json(
        { error: "این سؤال قابل ویرایش نیست" },
        { status: 400 }
      );
    }

    // Check if question has answers - if so, only allow body edit
    const [answerCount] = await db
      .select({ count: answers.id })
      .from(answers)
      .where(and(eq(answers.questionId, questionId), eq(answers.isHidden, false)))
      .limit(1);

    const hasAnswers = question.answersCount > 0;

    // Update question
    const updateData: { title?: string; body?: string; updatedAt: Date } = {
      body: questionBody.trim(),
      updatedAt: new Date(),
    };

    // Only allow title change if no answers yet
    if (!hasAnswers) {
      updateData.title = title.trim();
    }

    const [updatedQuestion] = await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, questionId))
      .returning();

    return NextResponse.json({
      message: hasAnswers
        ? "متن سؤال ویرایش شد (عنوان قابل تغییر نیست چون پاسخ دریافت کرده)"
        : "سؤال با موفقیت ویرایش شد",
      question: {
        id: updatedQuestion.id,
        title: updatedQuestion.title,
        body: updatedQuestion.body,
        updatedAt: updatedQuestion.updatedAt,
      },
      titleEditable: !hasAnswers,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "خطا در ویرایش سؤال" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/qa/questions/[id]
 * Delete a question (soft delete - only by author or admin, only if no answers)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id: questionId } = await params;

    // Get question
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: "سؤال یافت نشد" }, { status: 404 });
    }

    // Check ownership or admin
    const isOwner = question.authorId === session.user.id;
    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // Check if question has answers
    if (question.answersCount > 0 && !isAdmin) {
      return NextResponse.json(
        { error: "سؤال‌هایی که پاسخ دریافت کرده‌اند قابل حذف نیستند" },
        { status: 400 }
      );
    }

    // Soft delete
    await db
      .update(questions)
      .set({
        isHidden: true,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, questionId));

    return NextResponse.json({
      message: "سؤال با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "خطا در حذف سؤال" },
      { status: 500 }
    );
  }
}
