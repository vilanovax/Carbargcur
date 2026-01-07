import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles, jobs, jobApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/applications/[id] - Get single application details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const [result] = await db
      .select({
        application: jobApplications,
        job: jobs,
        profile: profiles,
      })
      .from(jobApplications)
      .leftJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .leftJoin(profiles, eq(jobApplications.profileId, profiles.id))
      .where(eq(jobApplications.id, id))
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "درخواست یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      application: {
        id: result.application.id,
        status: result.application.status,
        coverLetter: result.application.coverLetter,
        matchScore: result.application.matchScore,
        appliedAt: result.application.appliedAt,
        reviewedAt: result.application.reviewedAt,
        adminNotes: result.application.adminNotes,
      },
      job: result.job ? {
        id: result.job.id,
        title: result.job.title,
        company: result.job.company,
        city: result.job.city,
        employmentType: result.job.employmentType,
        experienceLevel: result.job.experienceLevel,
        requiredSkills: result.job.requiredSkills ? JSON.parse(result.job.requiredSkills) : [],
        preferredSkills: result.job.preferredSkills ? JSON.parse(result.job.preferredSkills) : [],
      } : null,
      applicant: result.profile ? {
        id: result.profile.id,
        firstName: result.profile.firstName,
        lastName: result.profile.lastName,
        email: result.profile.email,
        phone: result.profile.phone,
        username: result.profile.username,
        skills: result.profile.skills ? JSON.parse(result.profile.skills) : [],
        yearsOfExperience: result.profile.yearsOfExperience,
        currentPosition: result.profile.currentPosition,
        summary: result.profile.summary,
        discResult: result.profile.discResult,
        hollandResult: result.profile.hollandResult,
        resumeUrl: result.profile.resumeUrl,
      } : null,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات درخواست" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/applications/[id] - Update application status/notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes } = body;

    // Validate status
    const validStatuses = ["pending", "reviewed", "shortlisted", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "وضعیت نامعتبر" },
        { status: 400 }
      );
    }

    // Check if application exists
    const [existing] = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "درخواست یافت نشد" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status !== "pending") {
        updateData.reviewedAt = new Date();
      }
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    // Update application
    const [updated] = await db
      .update(jobApplications)
      .set(updateData)
      .where(eq(jobApplications.id, id))
      .returning();

    return NextResponse.json({
      application: updated,
      message: "درخواست با موفقیت به‌روز شد",
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی درخواست" },
      { status: 500 }
    );
  }
}
