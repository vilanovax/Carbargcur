import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/jobs/[id] - Get single job (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.isActive, true)))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: "شغل یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        city: job.city,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        minExperienceYears: job.minExperienceYears,
        maxExperienceYears: job.maxExperienceYears,
        requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
        preferredSkills: job.preferredSkills ? JSON.parse(job.preferredSkills) : [],
        preferredBehavior: job.preferredBehavior ? JSON.parse(job.preferredBehavior) : null,
        preferredCareerFit: job.preferredCareerFit ? JSON.parse(job.preferredCareerFit) : null,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        isFeatured: job.isFeatured,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "خطا در دریافت شغل" }, { status: 500 });
  }
}
