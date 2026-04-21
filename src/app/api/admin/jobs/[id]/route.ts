import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/api/auth";
import { validateJson } from "@/lib/api/validate";
import { jobUpdateSchema } from "@/lib/api/schemas";

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function serializeJob(job: typeof jobs.$inferSelect) {
  return {
    ...job,
    requiredSkills: safeParseJson(job.requiredSkills, []),
    preferredSkills: safeParseJson(job.preferredSkills, []),
    preferredBehavior: safeParseJson(job.preferredBehavior, null),
    preferredCareerFit: safeParseJson(job.preferredCareerFit, null),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);

    if (!job) {
      return NextResponse.json({ error: "شغل یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ job: serializeJob(job) });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "خطا در دریافت شغل" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const body = await validateJson(request, jobUpdateSchema);
    if (body instanceof NextResponse) return body;

    const { id } = await params;

    const [existingJob] = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    if (!existingJob) {
      return NextResponse.json({ error: "شغل یافت نشد" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.company !== undefined) updateData.company = body.company || null;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.city !== undefined) updateData.city = body.city || null;
    if (body.employmentType !== undefined) updateData.employmentType = body.employmentType || null;
    if (body.experienceLevel !== undefined) updateData.experienceLevel = body.experienceLevel || null;
    if (body.minExperienceYears !== undefined) updateData.minExperienceYears = body.minExperienceYears;
    if (body.maxExperienceYears !== undefined) updateData.maxExperienceYears = body.maxExperienceYears;
    if (body.requiredSkills !== undefined) {
      updateData.requiredSkills = body.requiredSkills ? JSON.stringify(body.requiredSkills) : null;
    }
    if (body.preferredSkills !== undefined) {
      updateData.preferredSkills = body.preferredSkills ? JSON.stringify(body.preferredSkills) : null;
    }
    if (body.preferredBehavior !== undefined) {
      updateData.preferredBehavior = body.preferredBehavior ? JSON.stringify(body.preferredBehavior) : null;
    }
    if (body.preferredCareerFit !== undefined) {
      updateData.preferredCareerFit = body.preferredCareerFit ? JSON.stringify(body.preferredCareerFit) : null;
    }
    if (body.salaryMin !== undefined)
      updateData.salaryMin = body.salaryMin != null ? String(body.salaryMin) : null;
    if (body.salaryMax !== undefined)
      updateData.salaryMax = body.salaryMax != null ? String(body.salaryMax) : null;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    const [updatedJob] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, id))
      .returning();

    return NextResponse.json({ job: serializeJob(updatedJob) });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "خطا در به‌روزرسانی شغل" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const [existingJob] = await db
      .select({ id: jobs.id })
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
