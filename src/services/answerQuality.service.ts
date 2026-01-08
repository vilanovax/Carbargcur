/**
 * Answer Quality Service
 * سرویس محاسبه و ذخیره کیفیت پاسخ‌ها
 */

import { db } from "@/lib/db";
import {
  answers,
  questions,
  answerReactions,
  answerFlags,
  answerQualityMetrics,
  profileStrengthSnapshot,
  userExpertiseStats,
  profiles,
} from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { computeAQS, extractAllSignals, type QualityLabel } from "@/lib/quality";

// ============= Types =============

export type RecomputeReason =
  | "NEW_ANSWER"
  | "REACTION"
  | "ACCEPT"
  | "FLAG"
  | "PROFILE_UPDATE"
  | "EDIT"
  | "CRON";

export interface RecomputeResult {
  answerId: string;
  aqs: number;
  label: QualityLabel;
  previousAqs?: number;
  previousLabel?: string;
  changed: boolean;
}

// ============= Helper Functions =============

/**
 * Get or create profile strength snapshot for a user
 */
async function getProfileStrength(userId: string): Promise<number> {
  // Try to get from snapshot
  const [snapshot] = await db
    .select({ strength: profileStrengthSnapshot.strength })
    .from(profileStrengthSnapshot)
    .where(eq(profileStrengthSnapshot.userId, userId))
    .limit(1);

  if (snapshot) {
    return snapshot.strength;
  }

  // Calculate from profile if no snapshot exists
  const [profile] = await db
    .select({ completionPercentage: profiles.completionPercentage })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  const strength = profile?.completionPercentage ?? 0;

  // Create snapshot for future use
  await db
    .insert(profileStrengthSnapshot)
    .values({ userId, strength })
    .onConflictDoUpdate({
      target: profileStrengthSnapshot.userId,
      set: { strength, updatedAt: new Date() },
    });

  return strength;
}

/**
 * Get author's answer statistics
 */
async function getAuthorStats(authorId: string): Promise<{
  totalAnswers: number;
  acceptedAnswers: number;
  expertLevel: string;
}> {
  // Get expertise stats
  const [stats] = await db
    .select({
      totalAnswers: userExpertiseStats.totalAnswers,
      expertLevel: userExpertiseStats.expertLevel,
    })
    .from(userExpertiseStats)
    .where(eq(userExpertiseStats.userId, authorId))
    .limit(1);

  // Count accepted answers
  const [acceptedCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(answers)
    .where(and(eq(answers.authorId, authorId), eq(answers.isAccepted, true)));

  return {
    totalAnswers: stats?.totalAnswers ?? 0,
    acceptedAnswers: Number(acceptedCount?.count ?? 0),
    expertLevel: stats?.expertLevel ?? "newcomer",
  };
}

// ============= Main Service Functions =============

/**
 * Recompute quality metrics for a single answer
 */
export async function recomputeAnswerQuality(
  answerId: string,
  reason: RecomputeReason
): Promise<RecomputeResult | null> {
  try {
    // Load answer with question
    const [answerData] = await db
      .select({
        answer: answers,
        question: questions,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(eq(answers.id, answerId))
      .limit(1);

    if (!answerData) {
      console.error(`Answer not found: ${answerId}`);
      return null;
    }

    const { answer, question } = answerData;

    // Load reactions
    const reactions = await db
      .select({
        type: answerReactions.type,
        userId: answerReactions.userId,
      })
      .from(answerReactions)
      .where(eq(answerReactions.answerId, answerId));

    // Load flags
    const flags = await db
      .select({ reason: answerFlags.reason })
      .from(answerFlags)
      .where(eq(answerFlags.answerId, answerId));

    // Get profile strength
    const profileStrength = await getProfileStrength(answer.authorId);

    // Get author stats
    const authorStats = await getAuthorStats(answer.authorId);

    // Get previous metrics for comparison
    const [previousMetrics] = await db
      .select({ aqs: answerQualityMetrics.aqs, label: answerQualityMetrics.label })
      .from(answerQualityMetrics)
      .where(eq(answerQualityMetrics.answerId, answerId))
      .limit(1);

    // Extract all signals
    const signals = extractAllSignals({
      answerBody: answer.body,
      category: question.category,
      reactions: reactions.map((r) => ({ type: r.type, userId: r.userId })),
      questionAuthorId: question.authorId,
      isAccepted: answer.isAccepted,
      flags: flags.map((f) => ({ reason: f.reason })),
      followupCount: 0, // TODO: implement followup tracking
      profileStrength,
      authorAcceptedAnswers: authorStats.acceptedAnswers,
      authorTotalAnswers: authorStats.totalAnswers,
      authorExpertLevel: authorStats.expertLevel,
      answerCreatedAt: new Date(answer.createdAt),
      questionCreatedAt: new Date(question.createdAt),
      answerUpdatedAt: new Date(answer.updatedAt),
      editCount: 0, // TODO: implement edit count tracking
    });

    // Compute AQS
    const result = computeAQS(signals);

    // Upsert metrics
    await db
      .insert(answerQualityMetrics)
      .values({
        answerId,
        contentScore: result.scores.content,
        engagementScore: result.scores.engagement,
        expertScore: result.scores.expert,
        trustScore: result.scores.trust,
        expertMultiplier: result.expertMultiplier,
        aqs: result.aqs,
        label: result.label,
        details: result.details,
        computedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: answerQualityMetrics.answerId,
        set: {
          contentScore: result.scores.content,
          engagementScore: result.scores.engagement,
          expertScore: result.scores.expert,
          trustScore: result.scores.trust,
          expertMultiplier: result.expertMultiplier,
          aqs: result.aqs,
          label: result.label,
          details: result.details,
          computedAt: new Date(),
        },
      });

    const changed =
      previousMetrics?.aqs !== result.aqs ||
      previousMetrics?.label !== result.label;

    // Log label changes for significant upgrades
    if (changed && (result.label === "STAR" || result.label === "PRO")) {
      console.log(
        `[AQS] Answer ${answerId} upgraded to ${result.label} (AQS: ${result.aqs})`
      );
    }

    return {
      answerId,
      aqs: result.aqs,
      label: result.label,
      previousAqs: previousMetrics?.aqs,
      previousLabel: previousMetrics?.label ?? undefined,
      changed,
    };
  } catch (error) {
    console.error(`Error recomputing AQS for answer ${answerId}:`, error);
    return null;
  }
}

/**
 * Recompute quality metrics for all answers to a question
 */
export async function recomputeQuestionAnswersQuality(
  questionId: string
): Promise<RecomputeResult[]> {
  const questionAnswers = await db
    .select({ id: answers.id })
    .from(answers)
    .where(eq(answers.questionId, questionId));

  const results: RecomputeResult[] = [];

  for (const answer of questionAnswers) {
    const result = await recomputeAnswerQuality(answer.id, "CRON");
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Update profile strength snapshot and recompute related answers
 */
export async function updateProfileStrengthAndRecompute(
  userId: string,
  newStrength: number
): Promise<void> {
  // Update snapshot
  await db
    .insert(profileStrengthSnapshot)
    .values({ userId, strength: newStrength })
    .onConflictDoUpdate({
      target: profileStrengthSnapshot.userId,
      set: { strength: newStrength, updatedAt: new Date() },
    });

  // Get all answers by this user
  const userAnswers = await db
    .select({ id: answers.id })
    .from(answers)
    .where(eq(answers.authorId, userId));

  // Recompute quality for all their answers
  for (const answer of userAnswers) {
    await recomputeAnswerQuality(answer.id, "PROFILE_UPDATE");
  }
}

/**
 * Get answers for a question, sorted by quality
 */
export async function getAnswersSortedByQuality(questionId: string): Promise<
  Array<{
    id: string;
    body: string;
    authorId: string;
    isAccepted: boolean;
    helpfulCount: number;
    expertBadgeCount: number;
    createdAt: Date;
    aqs: number;
    label: string;
  }>
> {
  const result = await db
    .select({
      id: answers.id,
      body: answers.body,
      authorId: answers.authorId,
      isAccepted: answers.isAccepted,
      helpfulCount: answers.helpfulCount,
      expertBadgeCount: answers.expertBadgeCount,
      createdAt: answers.createdAt,
      aqs: answerQualityMetrics.aqs,
      label: answerQualityMetrics.label,
    })
    .from(answers)
    .leftJoin(
      answerQualityMetrics,
      eq(answers.id, answerQualityMetrics.answerId)
    )
    .where(and(eq(answers.questionId, questionId), eq(answers.isHidden, false)))
    .orderBy(
      desc(answers.isAccepted),
      desc(answerQualityMetrics.aqs),
      desc(answers.createdAt)
    );

  return result.map((r) => ({
    ...r,
    createdAt: new Date(r.createdAt),
    aqs: r.aqs ?? 0,
    label: r.label ?? "NORMAL",
  }));
}

/**
 * Get answer quality metrics for admin debug view
 */
export async function getAnswerQualityDebug(answerId: string): Promise<{
  answer: {
    id: string;
    body: string;
    authorId: string;
    isAccepted: boolean;
    createdAt: Date;
  };
  metrics: {
    contentScore: number;
    engagementScore: number;
    expertScore: number;
    trustScore: number;
    expertMultiplier: number;
    aqs: number;
    label: string;
    details: unknown;
    computedAt: Date;
  } | null;
  reactions: Array<{ type: string; userId: string }>;
  flags: Array<{ reason: string; userId: string }>;
} | null> {
  const [answerData] = await db
    .select()
    .from(answers)
    .where(eq(answers.id, answerId))
    .limit(1);

  if (!answerData) return null;

  const [metrics] = await db
    .select()
    .from(answerQualityMetrics)
    .where(eq(answerQualityMetrics.answerId, answerId))
    .limit(1);

  const reactions = await db
    .select({ type: answerReactions.type, userId: answerReactions.userId })
    .from(answerReactions)
    .where(eq(answerReactions.answerId, answerId));

  const flags = await db
    .select({ reason: answerFlags.reason, userId: answerFlags.userId })
    .from(answerFlags)
    .where(eq(answerFlags.answerId, answerId));

  return {
    answer: {
      id: answerData.id,
      body: answerData.body,
      authorId: answerData.authorId,
      isAccepted: answerData.isAccepted,
      createdAt: new Date(answerData.createdAt),
    },
    metrics: metrics
      ? {
          contentScore: metrics.contentScore,
          engagementScore: metrics.engagementScore,
          expertScore: metrics.expertScore,
          trustScore: metrics.trustScore,
          expertMultiplier: metrics.expertMultiplier,
          aqs: metrics.aqs,
          label: metrics.label,
          details: metrics.details,
          computedAt: new Date(metrics.computedAt),
        }
      : null,
    reactions,
    flags,
  };
}

/**
 * Batch recompute for answers without metrics or stale metrics
 */
export async function batchRecomputeStaleAnswers(
  maxAgeDays: number = 7,
  limit: number = 100
): Promise<{ processed: number; updated: number }> {
  const staleDate = new Date();
  staleDate.setDate(staleDate.getDate() - maxAgeDays);
  const staleDateIso = staleDate.toISOString();

  // Find answers without metrics or with stale metrics
  const staleAnswers = await db
    .select({ id: answers.id })
    .from(answers)
    .leftJoin(
      answerQualityMetrics,
      eq(answers.id, answerQualityMetrics.answerId)
    )
    .where(
      sql`${answerQualityMetrics.id} IS NULL OR ${answerQualityMetrics.computedAt} < ${staleDateIso}::timestamp`
    )
    .limit(limit);

  let updated = 0;
  for (const answer of staleAnswers) {
    const result = await recomputeAnswerQuality(answer.id, "CRON");
    if (result?.changed) {
      updated++;
    }
  }

  return { processed: staleAnswers.length, updated };
}
