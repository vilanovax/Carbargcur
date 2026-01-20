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

    // Support both FocusedProfile (v2) and OnboardingProfile (v1)
    // Convert FocusedProfile to OnboardingProfile format if needed
    let skills = body.skills || body.coreSkills || [];
    let experiences = body.experiences || [];
    let education = body.education || undefined;

    // Convert FocusedProfile.recentExperience to WorkExperience format
    if (body.recentExperience && !body.experiences) {
      const recent = body.recentExperience;
      experiences = [{
        id: "recent-exp-1",
        title: recent.role || "",
        company: recent.company || "",
        fromYear: recent.fromYear || "",
        toYear: recent.toYear || "Present",
        description: recent.description || "",
      }];
    }

    // Convert FocusedProfile.latestEducation to Education format
    if (body.latestEducation && !body.education) {
      const latest = body.latestEducation;
      education = {
        degree: latest.degree || "",
        field: latest.field || "",
        university: latest.university || "",
      };
    }

    const {
      fullName,
      city,
      experienceLevel,
      jobStatus,
      summary,
      profilePhotoUrl,
      photoUrl,
      profilePhotoThumbnailUrl,
      resumeUrl,
      resumeFilename,
      slug,
      assessments,
      disc,
      holland,
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

    // Handle profile photo (support both photoUrl and profilePhotoUrl)
    const finalPhotoUrl = profilePhotoUrl || photoUrl;
    if (finalPhotoUrl) updateData.profilePhotoUrl = finalPhotoUrl;

    if (resumeUrl) updateData.resumeUrl = resumeUrl;
    if (resumeFilename) updateData.resumeFilename = resumeFilename;

    // Assessment results (support both direct fields and nested assessments object)
    const discResult = disc?.primary || assessments?.disc?.primary;
    const hollandResult = holland?.primary || assessments?.holland?.primary;

    if (discResult) {
      updateData.discResult = discResult;
    }
    if (hollandResult) {
      updateData.hollandResult = hollandResult;
    }

    // Calculate completion percentage
    let completionScore = 0;
    if (fullName) completionScore += 10;
    if (city) completionScore += 10;
    if (experienceLevel) completionScore += 10;
    if (jobStatus) completionScore += 10;
    if (skills && skills.length >= 1) completionScore += 20; // At least 1 skill (was 3)
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
