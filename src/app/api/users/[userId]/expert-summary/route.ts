import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userExpertSummary, answers, questions } from "@/lib/db/schema";
import { eq, and, desc, sql, gt, or } from "drizzle-orm";

/**
 * GET /api/users/[userId]/expert-summary - Get user's AI-generated expert summary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get existing summary
    const [summary] = await db
      .select()
      .from(userExpertSummary)
      .where(eq(userExpertSummary.userId, userId))
      .limit(1);

    if (!summary || !summary.summaryText) {
      // No summary exists yet
      return NextResponse.json({
        hasSummary: false,
        message: "خلاصه تخصص هنوز برای این کاربر تولید نشده است",
      });
    }

    // Parse JSON fields
    const keySignals = summary.keySignals ? JSON.parse(summary.keySignals) : [];
    const styleTags = summary.styleTags ? JSON.parse(summary.styleTags) : [];
    const mainDomains = summary.mainDomains ? JSON.parse(summary.mainDomains) : [];

    return NextResponse.json({
      hasSummary: true,
      summary: {
        text: summary.summaryText,
        keySignals,
        styleTags,
        mainDomains,
        confidenceLevel: summary.confidenceLevel,
        answersAnalyzed: summary.answersAnalyzed,
        generatedAt: summary.generatedAt,
        isVisible: summary.isVisible,
      },
    });
  } catch (error) {
    console.error("Error fetching expert summary:", error);
    return NextResponse.json(
      { error: "خطا در دریافت خلاصه تخصص" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[userId]/expert-summary/generate - Generate new AI summary (Admin only)
 * This would be called by an admin or a background job
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get quality answers for this user (for AI input)
    const qualityAnswers = await db
      .select({
        body: answers.body,
        category: questions.category,
        helpfulCount: answers.helpfulCount,
        expertBadgeCount: answers.expertBadgeCount,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(
        and(
          eq(answers.authorId, userId),
          eq(answers.isHidden, false),
          eq(questions.isHidden, false),
          or(
            gt(answers.expertBadgeCount, 0),
            gt(answers.helpfulCount, 2)
          )
        )
      )
      .orderBy(desc(answers.expertBadgeCount), desc(answers.helpfulCount))
      .limit(20);

    if (qualityAnswers.length < 3) {
      return NextResponse.json({
        generated: false,
        message: "تعداد پاسخ‌های باکیفیت کافی نیست (حداقل ۳ پاسخ)",
        answerCount: qualityAnswers.length,
      });
    }

    // Calculate domain distribution
    const domainCounts: Record<string, number> = {};
    for (const answer of qualityAnswers) {
      domainCounts[answer.category] = (domainCounts[answer.category] || 0) + 1;
    }

    const mainDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([domain]) => domain);

    // For MVP: Generate a template-based summary (no actual AI call)
    // In production, this would call OpenAI/Claude API
    const summaryText = generateTemplateSummary(qualityAnswers, mainDomains);
    const keySignals = extractKeySignals(qualityAnswers);
    const styleTags = inferStyleTags(qualityAnswers);
    const confidenceLevel = calculateConfidence(qualityAnswers);

    // Upsert summary
    const [existing] = await db
      .select()
      .from(userExpertSummary)
      .where(eq(userExpertSummary.userId, userId))
      .limit(1);

    if (existing) {
      await db
        .update(userExpertSummary)
        .set({
          summaryText,
          keySignals: JSON.stringify(keySignals),
          styleTags: JSON.stringify(styleTags),
          mainDomains: JSON.stringify(mainDomains),
          confidenceLevel,
          answersAnalyzed: qualityAnswers.length,
          generatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userExpertSummary.userId, userId));
    } else {
      await db.insert(userExpertSummary).values({
        userId,
        summaryText,
        keySignals: JSON.stringify(keySignals),
        styleTags: JSON.stringify(styleTags),
        mainDomains: JSON.stringify(mainDomains),
        confidenceLevel,
        answersAnalyzed: qualityAnswers.length,
        generatedBy: "system",
        isVisible: true,
      });
    }

    return NextResponse.json({
      generated: true,
      summary: {
        text: summaryText,
        keySignals,
        styleTags,
        mainDomains,
        confidenceLevel,
        answersAnalyzed: qualityAnswers.length,
      },
    });
  } catch (error) {
    console.error("Error generating expert summary:", error);
    return NextResponse.json(
      { error: "خطا در تولید خلاصه تخصص" },
      { status: 500 }
    );
  }
}

// Helper functions for template-based summary (MVP)

const DOMAIN_LABELS: Record<string, string> = {
  accounting: "حسابداری",
  finance: "مالی",
  tax: "مالیات",
  insurance: "بیمه",
  investment: "سرمایه‌گذاری",
};

function generateTemplateSummary(
  answers: { category: string; helpfulCount: number; expertBadgeCount: number }[],
  mainDomains: string[]
): string {
  const domainLabels = mainDomains
    .map((d) => DOMAIN_LABELS[d] || d)
    .join(" و ");

  const totalExpert = answers.reduce((sum, a) => sum + a.expertBadgeCount, 0);
  const totalHelpful = answers.reduce((sum, a) => sum + a.helpfulCount, 0);

  let expertise = "";
  if (totalExpert >= 10) {
    expertise = "با تجربه قابل توجه";
  } else if (totalExpert >= 5) {
    expertise = "با دانش کاربردی";
  } else {
    expertise = "فعال";
  }

  return `این کاربر ${expertise} در حوزه ${domainLabels} است. پاسخ‌های ایشان ${totalExpert} بار به عنوان «متخصصانه» و ${totalHelpful} بار به عنوان «مفید» شناخته شده‌اند.`;
}

function extractKeySignals(
  answers: { body: string; expertBadgeCount: number; helpfulCount: number }[]
): string[] {
  const signals: string[] = [];

  const totalAnswers = answers.length;
  const expertAnswers = answers.filter((a) => a.expertBadgeCount > 0).length;
  const avgLength = answers.reduce((sum, a) => sum + a.body.length, 0) / totalAnswers;

  if (expertAnswers / totalAnswers > 0.5) {
    signals.push("کیفیت بالای پاسخ‌ها");
  }

  if (avgLength > 500) {
    signals.push("پاسخ‌های جامع و مفصل");
  } else if (avgLength > 200) {
    signals.push("پاسخ‌های مختصر و مفید");
  }

  if (totalAnswers >= 10) {
    signals.push("مشارکت مستمر در انجمن");
  }

  signals.push("تمرکز بر مسائل تخصصی");

  return signals.slice(0, 4);
}

function inferStyleTags(
  answers: { body: string }[]
): string[] {
  const tags: string[] = [];

  const avgLength = answers.reduce((sum, a) => sum + a.body.length, 0) / answers.length;

  if (avgLength > 400) {
    tags.push("تحلیلی");
  }

  tags.push("ساختاریافته");

  // Check if answers tend to be detailed
  const detailedCount = answers.filter((a) => a.body.length > 300).length;
  if (detailedCount > answers.length * 0.6) {
    tags.push("جزئی‌نگر");
  } else {
    tags.push("کاربردی");
  }

  return tags.slice(0, 3);
}

function calculateConfidence(
  answers: { expertBadgeCount: number; helpfulCount: number }[]
): string {
  const totalExpert = answers.reduce((sum, a) => sum + a.expertBadgeCount, 0);
  const totalHelpful = answers.reduce((sum, a) => sum + a.helpfulCount, 0);
  const total = totalExpert * 2 + totalHelpful;

  if (total >= 30 && answers.length >= 10) {
    return "high";
  } else if (total >= 15 && answers.length >= 5) {
    return "medium";
  }
  return "low";
}
