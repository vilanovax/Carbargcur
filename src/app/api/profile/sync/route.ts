import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/profile/sync - Sync localStorage data to database
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (!existingProfile) {
      return NextResponse.json({ error: "پروفایل یافت نشد" }, { status: 404 });
    }

    const body = await request.json();
    const {
      fullName,
      city,
      experienceLevel,
      jobStatus,
      skills,
      summary,
      experiences,
      education,
      profilePhotoUrl,
      resumeUrl,
      resumeFilename,
      slug,
      assessments,
    } = body;

    // Build update object from localStorage data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (fullName) updateData.fullName = fullName;
    if (city) updateData.city = city;
    if (experienceLevel) updateData.experienceLevel = experienceLevel;
    if (jobStatus) updateData.jobStatus = jobStatus;
    if (skills && skills.length > 0) updateData.skills = JSON.stringify(skills);
    if (summary) updateData.professionalSummary = summary;
    if (experiences && experiences.length > 0) updateData.experiences = JSON.stringify(experiences);
    if (education) updateData.education = JSON.stringify(education);
    if (profilePhotoUrl) updateData.profilePhotoUrl = profilePhotoUrl;
    if (resumeUrl) updateData.resumeUrl = resumeUrl;
    if (resumeFilename) updateData.resumeFilename = resumeFilename;

    // Assessment results
    if (assessments?.disc?.primary) {
      updateData.discResult = assessments.disc.primary;
    }
    if (assessments?.holland?.primary) {
      updateData.hollandResult = assessments.holland.primary;
    }

    // Calculate completion percentage
    let completionScore = 0;
    if (fullName) completionScore += 10;
    if (city) completionScore += 10;
    if (experienceLevel) completionScore += 10;
    if (jobStatus) completionScore += 10;
    if (skills && skills.length >= 3) completionScore += 20;
    if (experiences && experiences.length >= 1) completionScore += 20;
    if (education && (education.degree || education.field)) completionScore += 10;
    if (summary) completionScore += 10;

    updateData.completionPercentage = Math.min(completionScore, 100);
    updateData.onboardingCompleted = completionScore >= 60;

    // Update profile
    const [updated] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, existingProfile.id))
      .returning();

    return NextResponse.json({
      success: true,
      profile: {
        ...updated,
        skills: updated.skills ? JSON.parse(updated.skills) : [],
        experiences: updated.experiences ? JSON.parse(updated.experiences) : [],
        education: updated.education ? JSON.parse(updated.education) : null,
      },
      message: "اطلاعات با موفقیت همگام‌سازی شد",
    });
  } catch (error) {
    console.error("Error syncing profile:", error);
    return NextResponse.json(
      { error: "خطا در همگام‌سازی پروفایل" },
      { status: 500 }
    );
  }
}
