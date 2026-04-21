import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/api/auth";
import { validateJson, validateQuery } from "@/lib/api/validate";
import { jobCreateSchema, paginationQuery } from "@/lib/api/schemas";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const parsedQuery = validateQuery(new URL(request.url).searchParams, paginationQuery);
    if (parsedQuery instanceof NextResponse) return parsedQuery;
    const { limit, offset } = parsedQuery;

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
        requiredSkills: safeParseJson(job.requiredSkills, []),
        preferredSkills: safeParseJson(job.preferredSkills, []),
        preferredBehavior: safeParseJson(job.preferredBehavior, null),
        preferredCareerFit: safeParseJson(job.preferredCareerFit, null),
      })),
      total: Number(count),
    });
  } catch (error) {
    console.error("Error fetching admin jobs:", error);
    return NextResponse.json({ error: "خطا در دریافت شغل‌ها" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const body = await validateJson(request, jobCreateSchema);
    if (body instanceof NextResponse) return body;

    const [newJob] = await db
      .insert(jobs)
      .values({
        title: body.title,
        company: body.company ?? null,
        description: body.description ?? null,
        city: body.city ?? null,
        employmentType: body.employmentType ?? null,
        experienceLevel: body.experienceLevel ?? null,
        minExperienceYears: body.minExperienceYears ?? null,
        maxExperienceYears: body.maxExperienceYears ?? null,
        requiredSkills: body.requiredSkills ? JSON.stringify(body.requiredSkills) : null,
        preferredSkills: body.preferredSkills ? JSON.stringify(body.preferredSkills) : null,
        preferredBehavior: body.preferredBehavior ? JSON.stringify(body.preferredBehavior) : null,
        preferredCareerFit: body.preferredCareerFit ? JSON.stringify(body.preferredCareerFit) : null,
        salaryMin: body.salaryMin != null ? String(body.salaryMin) : null,
        salaryMax: body.salaryMax != null ? String(body.salaryMax) : null,
        isFeatured: body.isFeatured ?? false,
        createdBy: auth.userId,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      })
      .returning();

    return NextResponse.json({ job: newJob }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "خطا در ایجاد شغل" }, { status: 500 });
  }
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
