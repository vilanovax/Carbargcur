import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles, jobs, jobApplications, assessments } from "@/lib/db/schema";
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
      ),
      job_stats AS (
        SELECT
          COUNT(*) AS total_jobs,
          COUNT(*) FILTER (WHERE is_active = true) AS active_jobs,
          COUNT(*) FILTER (WHERE is_featured = true) AS featured_jobs,
          COUNT(*) FILTER (WHERE created_at >= (SELECT seven_days_ago FROM date_ranges)) AS new_jobs_this_week
        FROM jobs
      ),
      application_stats AS (
        SELECT
          COUNT(*) AS total_applications,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_applications,
          COUNT(*) FILTER (WHERE status = 'reviewed') AS reviewed_applications,
          COUNT(*) FILTER (WHERE status = 'shortlisted') AS shortlisted_applications,
          COUNT(*) FILTER (WHERE applied_at >= (SELECT seven_days_ago FROM date_ranges)) AS applications_this_week
        FROM job_applications
      ),
      assessment_stats AS (
        SELECT
          COUNT(*) AS total_assessments,
          COUNT(*) FILTER (WHERE type = 'disc') AS disc_assessments,
          COUNT(*) FILTER (WHERE type = 'holland') AS holland_assessments,
          COUNT(*) FILTER (WHERE completed_at >= (SELECT seven_days_ago FROM date_ranges)) AS assessments_this_week
        FROM assessments
      ),
      question_stats AS (
        SELECT
          COUNT(*) AS total_questions,
          COUNT(*) FILTER (WHERE is_hidden = false) AS active_questions,
          COUNT(*) FILTER (WHERE created_at >= (SELECT seven_days_ago FROM date_ranges)) AS questions_this_week,
          COUNT(*) FILTER (
            WHERE created_at >= (SELECT fourteen_days_ago FROM date_ranges)
            AND created_at < (SELECT seven_days_ago FROM date_ranges)
          ) AS questions_last_week
        FROM questions
      ),
      answer_stats AS (
        SELECT
          COUNT(*) AS total_answers,
          COUNT(*) FILTER (WHERE is_hidden = false) AS active_answers,
          COUNT(*) FILTER (WHERE is_accepted = true) AS accepted_answers,
          COUNT(*) FILTER (WHERE created_at >= (SELECT seven_days_ago FROM date_ranges)) AS answers_this_week,
          COUNT(*) FILTER (
            WHERE created_at >= (SELECT fourteen_days_ago FROM date_ranges)
            AND created_at < (SELECT seven_days_ago FROM date_ranges)
          ) AS answers_last_week
        FROM answers
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
        p.resumes_last_week,
        j.total_jobs,
        j.active_jobs,
        j.featured_jobs,
        j.new_jobs_this_week,
        a.total_applications,
        a.pending_applications,
        a.reviewed_applications,
        a.shortlisted_applications,
        a.applications_this_week,
        s.total_assessments,
        s.disc_assessments,
        s.holland_assessments,
        s.assessments_this_week,
        q.total_questions,
        q.active_questions,
        q.questions_this_week,
        q.questions_last_week,
        ans.total_answers,
        ans.active_answers,
        ans.accepted_answers,
        ans.answers_this_week,
        ans.answers_last_week
      FROM user_stats u, profile_stats p, job_stats j, application_stats a, assessment_stats s, question_stats q, answer_stats ans
    `);

    // Handle both array result and rows property (Drizzle returns different formats)
    const resultArray = Array.isArray(statsResult) ? statsResult : ((statsResult as { rows?: unknown[] }).rows || []);
    const stats = (resultArray[0] || {}) as Record<string, number>;

    return NextResponse.json({
      // User stats
      totalUsers: Number(stats.total_users || 0),
      newUsersThisWeek: Number(stats.new_users_this_week || 0),
      newUsersLastWeek: Number(stats.new_users_last_week || 0),
      // Profile stats
      profileStarted: Number(stats.profile_started || 0),
      completeProfiles: Number(stats.complete_profiles || 0),
      activePublicProfiles: Number(stats.active_public_profiles || 0),
      generatedResumes: Number(stats.generated_resumes || 0),
      completedProfilesThisWeek: Number(stats.completed_profiles_this_week || 0),
      completedProfilesLastWeek: Number(stats.completed_profiles_last_week || 0),
      resumesThisWeek: Number(stats.resumes_this_week || 0),
      resumesLastWeek: Number(stats.resumes_last_week || 0),
      // Job stats
      totalJobs: Number(stats.total_jobs || 0),
      activeJobs: Number(stats.active_jobs || 0),
      featuredJobs: Number(stats.featured_jobs || 0),
      newJobsThisWeek: Number(stats.new_jobs_this_week || 0),
      // Application stats
      totalApplications: Number(stats.total_applications || 0),
      pendingApplications: Number(stats.pending_applications || 0),
      reviewedApplications: Number(stats.reviewed_applications || 0),
      shortlistedApplications: Number(stats.shortlisted_applications || 0),
      applicationsThisWeek: Number(stats.applications_this_week || 0),
      // Assessment stats
      totalAssessments: Number(stats.total_assessments || 0),
      discAssessments: Number(stats.disc_assessments || 0),
      hollandAssessments: Number(stats.holland_assessments || 0),
      assessmentsThisWeek: Number(stats.assessments_this_week || 0),
      // Q&A stats
      totalQuestions: Number(stats.total_questions || 0),
      activeQuestions: Number(stats.active_questions || 0),
      questionsThisWeek: Number(stats.questions_this_week || 0),
      questionsLastWeek: Number(stats.questions_last_week || 0),
      totalAnswers: Number(stats.total_answers || 0),
      activeAnswers: Number(stats.active_answers || 0),
      acceptedAnswers: Number(stats.accepted_answers || 0),
      answersThisWeek: Number(stats.answers_this_week || 0),
      answersLastWeek: Number(stats.answers_last_week || 0),
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
