import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/jobs - Get all jobs (admin only)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const jobsList = await db
      .select()
      .from(jobs)
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs);

    return NextResponse.json({
      jobs: jobsList.map((job) => ({
        ...job,
        requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
        preferredSkills: job.preferredSkills ? JSON.parse(job.preferredSkills) : [],
        preferredBehavior: job.preferredBehavior ? JSON.parse(job.preferredBehavior) : null,
        preferredCareerFit: job.preferredCareerFit ? JSON.parse(job.preferredCareerFit) : null,
      })),
      total: Number(count),
    });
  } catch (error) {
    console.error("Error fetching admin jobs:", error);
    return NextResponse.json({ error: "خطا در دریافت شغل‌ها" }, { status: 500 });
  }
}

/**
 * POST /api/admin/jobs - Create new job (admin only)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

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
      expiresAt,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان شغل الزامی است" }, { status: 400 });
    }

    const [newJob] = await db
      .insert(jobs)
      .values({
        title,
        company: company || null,
        description: description || null,
        city: city || null,
        employmentType: employmentType || null,
        experienceLevel: experienceLevel || null,
        minExperienceYears: minExperienceYears || null,
        maxExperienceYears: maxExperienceYears || null,
        requiredSkills: requiredSkills ? JSON.stringify(requiredSkills) : null,
        preferredSkills: preferredSkills ? JSON.stringify(preferredSkills) : null,
        preferredBehavior: preferredBehavior ? JSON.stringify(preferredBehavior) : null,
        preferredCareerFit: preferredCareerFit ? JSON.stringify(preferredCareerFit) : null,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        isFeatured: isFeatured || false,
        createdBy: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return NextResponse.json({ job: newJob }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "خطا در ایجاد شغل" }, { status: 500 });
  }
}
