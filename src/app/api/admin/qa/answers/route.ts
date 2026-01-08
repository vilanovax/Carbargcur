import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { answers, users, questions, answerQualityMetrics } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/admin/qa/answers
 * Get list of answers with quality metrics (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Check admin status
    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "دسترسی فقط برای ادمین" }, { status: 403 });
    }

    // Get answers with metrics
    const answersData = await db
      .select({
        answer: answers,
        author: {
          fullName: users.fullName,
        },
        question: {
          id: questions.id,
          title: questions.title,
        },
        quality: {
          aqs: answerQualityMetrics.aqs,
          label: answerQualityMetrics.label,
        },
      })
      .from(answers)
      .leftJoin(users, eq(answers.authorId, users.id))
      .leftJoin(questions, eq(answers.questionId, questions.id))
      .leftJoin(answerQualityMetrics, eq(answers.id, answerQualityMetrics.answerId))
      .orderBy(desc(answers.createdAt))
      .limit(50);

    const formattedAnswers = answersData.map((a) => ({
      id: a.answer.id,
      body: a.answer.body,
      aqs: a.quality?.aqs ?? 0,
      label: a.quality?.label ?? "NORMAL",
      isAccepted: a.answer.isAccepted,
      createdAt: a.answer.createdAt,
      authorName: a.author?.fullName || "کاربر",
      questionTitle: a.question?.title || "سؤال حذف شده",
      questionId: a.question?.id || "",
    }));

    return NextResponse.json({ answers: formattedAnswers });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پاسخ‌ها" },
      { status: 500 }
    );
  }
}
