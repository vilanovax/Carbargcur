import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  userExpertiseStats,
  userBadges,
  badges,
  userDomainExpertise,
  answers,
  questions,
} from "@/lib/db/schema";
import { eq, and, desc, sql, gt } from "drizzle-orm";
import {
  calculateExpertScore,
  getExpertLevel,
  getNextLevel,
  checkEligibleBadges,
  checkDomainBadges,
  LEVEL_COLORS,
} from "@/lib/expertSystem";

/**
 * GET /api/users/[userId]/expertise - Get user's expertise info (level, score, badges)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get user expertise stats
    let [stats] = await db
      .select()
      .from(userExpertiseStats)
      .where(eq(userExpertiseStats.userId, userId))
      .limit(1);

    // If no stats exist, calculate from scratch
    if (!stats) {
      // Calculate stats from answers
      const [answerStats] = await db
        .select({
          totalAnswers: sql<number>`count(*)::int`,
          helpfulReactions: sql<number>`COALESCE(sum(${answers.helpfulCount}), 0)::int`,
          expertReactions: sql<number>`COALESCE(sum(${answers.expertBadgeCount}), 0)::int`,
        })
        .from(answers)
        .where(and(eq(answers.authorId, userId), eq(answers.isHidden, false)));

      const score = calculateExpertScore({
        totalAnswers: answerStats?.totalAnswers || 0,
        helpfulReactions: answerStats?.helpfulReactions || 0,
        expertReactions: answerStats?.expertReactions || 0,
        featuredAnswers: 0,
      });

      const level = getExpertLevel(score);

      // Create stats record
      const [newStats] = await db
        .insert(userExpertiseStats)
        .values({
          userId,
          totalAnswers: answerStats?.totalAnswers || 0,
          helpfulReactions: answerStats?.helpfulReactions || 0,
          expertReactions: answerStats?.expertReactions || 0,
          featuredAnswers: 0,
          expertScore: score,
          expertLevel: level.code,
        })
        .returning();

      stats = newStats;
    }

    // Get user's badges
    const userBadgeList = await db
      .select({
        badge: badges,
        awardedAt: userBadges.awardedAt,
        source: userBadges.source,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.awardedAt));

    // Get domain expertise
    const domainStats = await db
      .select()
      .from(userDomainExpertise)
      .where(eq(userDomainExpertise.userId, userId));

    // Calculate current level and next level
    const currentLevel = getExpertLevel(stats.expertScore);
    const nextLevelInfo = getNextLevel(stats.expertScore);

    // Check for eligible badges user doesn't have yet
    const currentBadgeCodes = userBadgeList.map((ub) => ub.badge.code);
    const eligibleBadges = checkEligibleBadges({
      totalAnswers: stats.totalAnswers,
      helpfulReactions: stats.helpfulReactions,
      expertReactions: stats.expertReactions,
      featuredAnswers: stats.featuredAnswers,
    });
    const eligibleDomainBadges = checkDomainBadges(
      domainStats.map((d) => ({
        category: d.category,
        expertAnswers: d.expertAnswers,
      }))
    );
    const allEligible = [...eligibleBadges, ...eligibleDomainBadges];
    const pendingBadges = allEligible.filter((code) => !currentBadgeCodes.includes(code));

    // Get featured answers
    const featuredAnswers = await db
      .select({
        answerId: answers.id,
        questionId: questions.id,
        questionTitle: questions.title,
        helpfulCount: answers.helpfulCount,
        expertBadgeCount: answers.expertBadgeCount,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(
        and(
          eq(answers.authorId, userId),
          eq(answers.isHidden, false),
          gt(answers.expertBadgeCount, 0)
        )
      )
      .orderBy(desc(answers.expertBadgeCount))
      .limit(5);

    return NextResponse.json({
      // Expert Level
      expertLevel: {
        code: currentLevel.code,
        titleFa: currentLevel.titleFa,
        titleEn: currentLevel.titleEn,
        description: currentLevel.description,
        colors: LEVEL_COLORS[currentLevel.code],
      },
      expertScore: stats.expertScore,

      // Progress to next level
      nextLevel: nextLevelInfo
        ? {
            level: {
              code: nextLevelInfo.level.code,
              titleFa: nextLevelInfo.level.titleFa,
            },
            pointsNeeded: nextLevelInfo.pointsNeeded,
            progress: Math.round(
              ((stats.expertScore - currentLevel.minScore) /
                (nextLevelInfo.level.minScore - currentLevel.minScore)) *
                100
            ),
          }
        : null,

      // Stats
      stats: {
        totalAnswers: stats.totalAnswers,
        helpfulReactions: stats.helpfulReactions,
        expertReactions: stats.expertReactions,
        featuredAnswers: stats.featuredAnswers,
        topCategory: stats.topCategory,
      },

      // Badges
      badges: userBadgeList.map((ub) => ({
        code: ub.badge.code,
        titleFa: ub.badge.titleFa,
        titleEn: ub.badge.titleEn,
        description: ub.badge.description,
        icon: ub.badge.icon,
        category: ub.badge.category,
        awardedAt: ub.awardedAt,
        source: ub.source,
      })),

      // Pending badges (user is eligible but hasn't been awarded yet)
      pendingBadges,

      // Domain expertise
      domainExpertise: domainStats.map((d) => ({
        category: d.category,
        totalAnswers: d.totalAnswers,
        expertAnswers: d.expertAnswers,
        helpfulAnswers: d.helpfulAnswers,
      })),

      // Featured answers
      featuredAnswers,
    });
  } catch (error) {
    console.error("Error fetching user expertise:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات تخصص" },
      { status: 500 }
    );
  }
}
