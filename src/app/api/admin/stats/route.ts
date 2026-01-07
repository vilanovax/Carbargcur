import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز - فقط ادمین‌ها" },
        { status: 403 }
      );
    }

    // Calculate 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Calculate 14 days ago (for previous week comparison)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Get total users count
    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = Number(totalUsersResult?.count || 0);

    // Get profile stats - total profiles
    const [totalProfilesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles);
    const profileStarted = Number(totalProfilesResult?.count || 0);

    // Get completed profiles
    const [completedProfilesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(eq(profiles.onboardingCompleted, true));
    const completeProfiles = Number(completedProfilesResult?.count || 0);

    // Get active public profiles
    const [publicActiveResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(and(eq(profiles.isPublic, true), eq(profiles.isActive, true)));
    const activePublicProfiles = Number(publicActiveResult?.count || 0);

    // Get profiles with resumes
    const [resumesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(sql`${profiles.resumeUrl} is not null`);
    const generatedResumes = Number(resumesResult?.count || 0);

    // Get new users this week
    const [newUsersThisWeekResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));
    const newUsersThisWeek = Number(newUsersThisWeekResult?.count || 0);

    // Get new users last week
    const [newUsersLastWeekResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          gte(users.createdAt, fourteenDaysAgo),
          sql`${users.createdAt} < ${sevenDaysAgo}`
        )
      );
    const newUsersLastWeek = Number(newUsersLastWeekResult?.count || 0);

    // Get completed profiles this week
    const [completedProfilesThisWeekResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(
        and(
          eq(profiles.onboardingCompleted, true),
          gte(profiles.updatedAt, sevenDaysAgo)
        )
      );
    const completedProfilesThisWeek = Number(
      completedProfilesThisWeekResult?.count || 0
    );

    // Get completed profiles last week
    const [completedProfilesLastWeekResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(
        and(
          eq(profiles.onboardingCompleted, true),
          gte(profiles.updatedAt, fourteenDaysAgo),
          sql`${profiles.updatedAt} < ${sevenDaysAgo}`
        )
      );
    const completedProfilesLastWeek = Number(
      completedProfilesLastWeekResult?.count || 0
    );

    // Get resumes uploaded this week
    const [resumesThisWeekResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(
        and(
          sql`${profiles.resumeUrl} is not null`,
          gte(sql`${profiles.resumeUploadedAt}`, sevenDaysAgo)
        )
      );
    const resumesThisWeek = Number(resumesThisWeekResult?.count || 0);

    // Get resumes uploaded last week
    const [resumesLastWeekResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(
        and(
          sql`${profiles.resumeUrl} is not null`,
          gte(sql`${profiles.resumeUploadedAt}`, fourteenDaysAgo),
          sql`${profiles.resumeUploadedAt} < ${sevenDaysAgo}`
        )
      );
    const resumesLastWeek = Number(resumesLastWeekResult?.count || 0);

    return NextResponse.json({
      totalUsers,
      profileStarted,
      completeProfiles,
      activePublicProfiles,
      generatedResumes,
      completedAssessments: 0, // Not implemented yet
      newUsersThisWeek,
      newUsersLastWeek,
      completedProfilesThisWeek,
      completedProfilesLastWeek,
      resumesThisWeek,
      resumesLastWeek,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آمار سیستم" },
      { status: 500 }
    );
  }
}
