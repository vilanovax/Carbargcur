import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  questionBookmarks,
  questions,
  profiles,
  users,
  questionEngagement,
  answerQualityMetrics,
  answers,
  userExpertiseStats,
} from "@/lib/db/schema";
import { and, desc, eq, gte, gt, or, sql, inArray } from "drizzle-orm";
import type { FocusedProfile } from "@/lib/onboarding";

function safeParseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export type UserBookmark = {
  id: string;
  bookmarkedAt: string;
  question: {
    id: string;
    title: string;
    body: string;
    category: string;
    tags: string[];
    answersCount: number;
    createdAt: string;
    authorName: string;
  };
};

export const getUserBookmarks = cache(
  async (userId: string, limit = 50): Promise<UserBookmark[]> => {
    const rows = await db
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
          eq(questionBookmarks.userId, userId),
          eq(questions.isHidden, false)
        )
      )
      .orderBy(desc(questionBookmarks.createdAt))
      .limit(limit);

    return rows.map((b) => ({
      id: b.id,
      bookmarkedAt: b.bookmarkedAt.toISOString(),
      question: {
        id: b.question.id,
        title: b.question.title,
        body: b.question.body,
        category: b.question.category,
        tags: safeParseTags(b.question.tags),
        answersCount: b.question.answersCount,
        createdAt: b.question.createdAt.toISOString(),
        authorName: b.authorName || "کاربر",
      },
    }));
  }
);

export type QuestionListItem = {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  answersCount: number;
  createdAt: string;
  author: {
    fullName: string;
    profilePhotoUrl: string | null;
  };
};

export const listQuestions = cache(
  async (options: {
    category?: string | null;
    limit?: number;
    offset?: number;
  } = {}): Promise<QuestionListItem[]> => {
    const { category, limit = 20, offset = 0 } = options;
    const conditions = [eq(questions.isHidden, false)];
    if (category) conditions.push(eq(questions.category, category));

    const rows = await db
      .select({
        question: questions,
        authorFullName: users.fullName,
        profileFullName: profiles.fullName,
        profilePhotoUrl: profiles.profilePhotoUrl,
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(questions.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map((r) => ({
      id: r.question.id,
      title: r.question.title,
      body:
        r.question.body.substring(0, 200) +
        (r.question.body.length > 200 ? "..." : ""),
      category: r.question.category,
      tags: safeParseTags(r.question.tags),
      answersCount: r.question.answersCount,
      createdAt: r.question.createdAt.toISOString(),
      author: {
        fullName: r.profileFullName || r.authorFullName || "کاربر",
        profilePhotoUrl: r.profilePhotoUrl ?? null,
      },
    }));
  }
);

export type QAOverviewStats = {
  totalQuestions: number;
  totalAnswers: number;
  verifiedAnswers: number;
  activeExperts: number;
  hotToday: number;
};

export const getQAOverview = cache(async (): Promise<QAOverviewStats> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = yesterday.toISOString();

  const [questionsAgg, answersAgg] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        hotToday: sql<number>`count(*) filter (where ${questions.createdAt} >= ${yesterdayIso}::timestamp)::int`,
      })
      .from(questions)
      .where(eq(questions.isHidden, false)),

    db
      .select({
        total: sql<number>`count(*)::int`,
        verified: sql<number>`count(*) filter (where ${answers.expertBadgeCount} > 0)::int`,
        activeExperts: sql<number>`count(distinct ${answers.authorId})::int`,
      })
      .from(answers)
      .where(eq(answers.isHidden, false)),
  ]);

  return {
    totalQuestions: questionsAgg[0]?.total ?? 0,
    totalAnswers: answersAgg[0]?.total ?? 0,
    verifiedAnswers: answersAgg[0]?.verified ?? 0,
    activeExperts: answersAgg[0]?.activeExperts ?? 0,
    hotToday: questionsAgg[0]?.hotToday ?? 0,
  };
});

export type UnansweredQuestion = {
  id: string;
  title: string;
  category: string;
  createdAt: string;
};

export const getFocusedProfile = cache(
  async (userId: string): Promise<FocusedProfile | null> => {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    if (!row) return null;

    const extras = (row.extras as Record<string, unknown> | null) || {};
    return {
      fullName: row.fullName ?? undefined,
      city: row.city ?? undefined,
      experienceLevel: (row.experienceLevel as FocusedProfile["experienceLevel"]) ?? undefined,
      jobStatus: (row.jobStatus as FocusedProfile["jobStatus"]) ?? undefined,
      skills: row.skills ? safeParseJson(row.skills, []) : [],
      summary: row.professionalSummary ?? undefined,
      experiences: row.experiences ? safeParseJson(row.experiences, []) : [],
      education: row.education ? safeParseJson(row.education, undefined) : undefined,
      profilePhotoUrl: row.profilePhotoUrl ?? undefined,
      profilePhotoThumbnailUrl:
        (extras.profilePhotoThumbnailUrl as string | undefined) ?? undefined,
      resumeUrl: row.resumeUrl ?? undefined,
      resumeFilename: row.resumeFilename ?? undefined,
      slug: row.slug ?? undefined,
      recentExperience: extras.recentExperience as FocusedProfile["recentExperience"],
      coreSkills: Array.isArray(extras.coreSkills) ? (extras.coreSkills as string[]) : undefined,
      careerFocus: extras.careerFocus as FocusedProfile["careerFocus"],
      latestEducation: extras.latestEducation as FocusedProfile["latestEducation"],
      certifications: Array.isArray(extras.certifications)
        ? (extras.certifications as FocusedProfile["certifications"])
        : undefined,
      personality: extras.personality as FocusedProfile["personality"],
      assessments: extras.assessments as FocusedProfile["assessments"],
    };
  }
);

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const getUnansweredQuestions = cache(
  async (limit = 5): Promise<UnansweredQuestion[]> => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString();

    const rows = await db
      .select({
        id: questions.id,
        title: questions.title,
        category: questions.category,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .where(
        and(
          eq(questions.isHidden, false),
          eq(questions.answersCount, 0),
          sql`${questions.createdAt} >= ${yesterdayIso}::timestamp`
        )
      )
      .orderBy(desc(questions.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      createdAt: r.createdAt.toISOString(),
    }));
  }
);
