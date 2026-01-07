import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
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

    // Single optimized query for all stats
    const statsResult = await db.execute(sql`
      WITH date_ranges AS (
        SELECT
          NOW() - INTERVAL '7 days' AS seven_days_ago,
          NOW() - INTERVAL '14 days' AS fourteen_days_ago
      ),
      user_stats AS (
        SELECT
          COUNT(*) AS total_users,
          COUNT(*) FILTER (WHERE created_at >= (SELECT seven_days_ago FROM date_ranges)) AS new_users_this_week,
          COUNT(*) FILTER (
            WHERE created_at >= (SELECT fourteen_days_ago FROM date_ranges)
            AND created_at < (SELECT seven_days_ago FROM date_ranges)
          ) AS new_users_last_week
        FROM users
      ),
      profile_stats AS (
        SELECT
          COUNT(*) AS profile_started,
          COUNT(*) FILTER (WHERE onboarding_completed = true) AS complete_profiles,
          COUNT(*) FILTER (WHERE is_public = true AND is_active = true) AS active_public_profiles,
          COUNT(*) FILTER (WHERE resume_url IS NOT NULL) AS generated_resumes,
          COUNT(*) FILTER (
            WHERE onboarding_completed = true
            AND updated_at >= (SELECT seven_days_ago FROM date_ranges)
          ) AS completed_profiles_this_week,
          COUNT(*) FILTER (
            WHERE onboarding_completed = true
            AND updated_at >= (SELECT fourteen_days_ago FROM date_ranges)
            AND updated_at < (SELECT seven_days_ago FROM date_ranges)
          ) AS completed_profiles_last_week,
          COUNT(*) FILTER (
            WHERE resume_url IS NOT NULL
            AND resume_uploaded_at >= (SELECT seven_days_ago FROM date_ranges)
          ) AS resumes_this_week,
          COUNT(*) FILTER (
            WHERE resume_url IS NOT NULL
            AND resume_uploaded_at >= (SELECT fourteen_days_ago FROM date_ranges)
            AND resume_uploaded_at < (SELECT seven_days_ago FROM date_ranges)
          ) AS resumes_last_week
        FROM profiles
      )
      SELECT
        u.total_users,
        u.new_users_this_week,
        u.new_users_last_week,
        p.profile_started,
        p.complete_profiles,
        p.active_public_profiles,
        p.generated_resumes,
        p.completed_profiles_this_week,
        p.completed_profiles_last_week,
        p.resumes_this_week,
        p.resumes_last_week
      FROM user_stats u, profile_stats p
    `);

    const stats = statsResult.rows[0] as Record<string, number>;

    return NextResponse.json({
      totalUsers: Number(stats.total_users || 0),
      profileStarted: Number(stats.profile_started || 0),
      completeProfiles: Number(stats.complete_profiles || 0),
      activePublicProfiles: Number(stats.active_public_profiles || 0),
      generatedResumes: Number(stats.generated_resumes || 0),
      completedAssessments: 0, // Not implemented yet
      newUsersThisWeek: Number(stats.new_users_this_week || 0),
      newUsersLastWeek: Number(stats.new_users_last_week || 0),
      completedProfilesThisWeek: Number(stats.completed_profiles_this_week || 0),
      completedProfilesLastWeek: Number(stats.completed_profiles_last_week || 0),
      resumesThisWeek: Number(stats.resumes_this_week || 0),
      resumesLastWeek: Number(stats.resumes_last_week || 0),
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آمار سیستم" },
      { status: 500 }
    );
  }
}
