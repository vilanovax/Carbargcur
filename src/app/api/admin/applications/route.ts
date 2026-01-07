import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles, jobs, jobApplications } from "@/lib/db/schema";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/applications - List all job applications (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, reviewed, shortlisted, rejected
    const jobId = searchParams.get("jobId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(jobApplications.status, status));
    }
    if (jobId) {
      conditions.push(eq(jobApplications.jobId, jobId));
    }

    // Get applications with joins
    const applicationsQuery = db
      .select({
        application: jobApplications,
        job: {
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
        },
        profile: {
          id: profiles.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          email: profiles.email,
          phone: profiles.phone,
          skills: profiles.skills,
          yearsOfExperience: profiles.yearsOfExperience,
          username: profiles.username,
        },
      })
      .from(jobApplications)
      .leftJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .leftJoin(profiles, eq(jobApplications.profileId, profiles.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(jobApplications.appliedAt))
      .limit(limit)
      .offset(offset);

    const applications = await applicationsQuery;

    // Filter by search if provided (after join since we need profile info)
    let filteredApplications = applications;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = applications.filter(
        (app) =>
          app.profile?.firstName?.toLowerCase().includes(searchLower) ||
          app.profile?.lastName?.toLowerCase().includes(searchLower) ||
          app.profile?.email?.toLowerCase().includes(searchLower) ||
          app.job?.title?.toLowerCase().includes(searchLower) ||
          app.job?.company?.toLowerCase().includes(searchLower)
      );
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobApplications)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      applications: filteredApplications.map((app) => ({
        id: app.application.id,
        status: app.application.status,
        coverLetter: app.application.coverLetter,
        matchScore: app.application.matchScore,
        appliedAt: app.application.appliedAt,
        reviewedAt: app.application.reviewedAt,
        adminNotes: app.application.adminNotes,
        job: app.job,
        applicant: {
          profileId: app.profile?.id,
          name: app.profile ? `${app.profile.firstName || ""} ${app.profile.lastName || ""}`.trim() : "نامشخص",
          email: app.profile?.email,
          phone: app.profile?.phone,
          skills: app.profile?.skills ? JSON.parse(app.profile.skills) : [],
          yearsOfExperience: app.profile?.yearsOfExperience,
          username: app.profile?.username,
        },
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "خطا در دریافت درخواست‌ها" },
      { status: 500 }
    );
  }
}
