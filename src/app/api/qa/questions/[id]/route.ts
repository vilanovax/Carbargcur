import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, users, profiles, answerQualityMetrics, answerReactions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
