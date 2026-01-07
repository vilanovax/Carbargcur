import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface JobResponse {
  id: string;
  title: string;
  company: string | null;
  description: string | null;
  city: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  requiredSkills: string[];
  preferredSkills: string[];
  preferredBehavior: {
    primary?: string;
    traits?: string[];
  } | null;
  preferredCareerFit: {
    primary?: string;
    secondary?: string;
  } | null;
  salaryMin: string | null;
  salaryMax: string | null;
  isFeatured: boolean;
  createdAt: string;
}

/**
 * GET /api/jobs - Get active jobs list
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");
    const experienceLevel = searchParams.get("experienceLevel");
    const city = searchParams.get("city");
    const featured = searchParams.get("featured") === "true";

    // Build conditions
    const conditions = [
      eq(jobs.isActive, true),
      // Only show non-expired jobs
      sql`(${jobs.expiresAt} IS NULL OR ${jobs.expiresAt} > NOW())`,
    ];

    if (experienceLevel) {
      conditions.push(eq(jobs.experienceLevel, experienceLevel));
    }
    if (city) {
      conditions.push(eq(jobs.city, city));
    }
    if (featured) {
      conditions.push(eq(jobs.isFeatured, true));
    }

    const jobsList = await db
      .select()
      .from(jobs)
      .where(and(...conditions))
      .orderBy(desc(jobs.isFeatured), desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(and(...conditions));

    const formattedJobs: JobResponse[] = jobsList.map((job) => ({
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
      createdAt: job.createdAt.toISOString(),
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      total: Number(count),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیست شغل‌ها" },
      { status: 500 }
    );
  }
}
