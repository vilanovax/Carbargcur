import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/jobs/[id] - Get single job (admin only)
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

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "فقط ادمین‌ها" }, { status: 403 });
    }

    const { id } = await params;

    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);

    if (!job) {
      return NextResponse.json({ error: "شغل یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({
      job: {
        ...job,
        requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
        preferredSkills: job.preferredSkills ? JSON.parse(job.preferredSkills) : [],
        preferredBehavior: job.preferredBehavior ? JSON.parse(job.preferredBehavior) : null,
        preferredCareerFit: job.preferredCareerFit ? JSON.parse(job.preferredCareerFit) : null,
      },
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "خطا در دریافت شغل" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/jobs/[id] - Update job (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "فقط ادمین‌ها" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if job exists
    const [existingJob] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    if (!existingJob) {
      return NextResponse.json({ error: "شغل یافت نشد" }, { status: 404 });
    }

    const {
      title,
      company,
      description,
      city,
      employmentType,
      experienceLevel,
      minExperienceYears,
      maxExperienceYears,
      requiredSkills,
      preferredSkills,
      preferredBehavior,
      preferredCareerFit,
      salaryMin,
      salaryMax,
      isFeatured,
      isActive,
      expiresAt,
    } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (title !== undefined) updateData.title = title;
    if (company !== undefined) updateData.company = company || null;
    if (description !== undefined) updateData.description = description || null;
    if (city !== undefined) updateData.city = city || null;
    if (employmentType !== undefined) updateData.employmentType = employmentType || null;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel || null;
    if (minExperienceYears !== undefined) updateData.minExperienceYears = minExperienceYears;
    if (maxExperienceYears !== undefined) updateData.maxExperienceYears = maxExperienceYears;
    if (requiredSkills !== undefined) {
      updateData.requiredSkills = requiredSkills ? JSON.stringify(requiredSkills) : null;
    }
    if (preferredSkills !== undefined) {
      updateData.preferredSkills = preferredSkills ? JSON.stringify(preferredSkills) : null;
    }
    if (preferredBehavior !== undefined) {
      updateData.preferredBehavior = preferredBehavior ? JSON.stringify(preferredBehavior) : null;
    }
    if (preferredCareerFit !== undefined) {
      updateData.preferredCareerFit = preferredCareerFit ? JSON.stringify(preferredCareerFit) : null;
    }
    if (salaryMin !== undefined) updateData.salaryMin = salaryMin || null;
    if (salaryMax !== undefined) updateData.salaryMax = salaryMax || null;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const [updatedJob] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, id))
      .returning();

    return NextResponse.json({
      job: {
        ...updatedJob,
        requiredSkills: updatedJob.requiredSkills ? JSON.parse(updatedJob.requiredSkills) : [],
        preferredSkills: updatedJob.preferredSkills ? JSON.parse(updatedJob.preferredSkills) : [],
        preferredBehavior: updatedJob.preferredBehavior ? JSON.parse(updatedJob.preferredBehavior) : null,
        preferredCareerFit: updatedJob.preferredCareerFit ? JSON.parse(updatedJob.preferredCareerFit) : null,
      },
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "خطا در به‌روزرسانی شغل" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/jobs/[id] - Delete job (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "فقط ادمین‌ها" }, { status: 403 });
    }

    const { id } = await params;

    // Check if job exists
    const [existingJob] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    if (!existingJob) {
      return NextResponse.json({ error: "شغل یافت نشد" }, { status: 404 });
    }

    await db.delete(jobs).where(eq(jobs.id, id));

    return NextResponse.json({ success: true, message: "شغل با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "خطا در حذف شغل" }, { status: 500 });
  }
}
