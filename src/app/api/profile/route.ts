import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * GET /api/profile - Get current user's profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "پروفایل یافت نشد" }, { status: 404 });
    }

    const extras = (profile.extras as Record<string, unknown> | null) || {};

    return NextResponse.json({
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        city: profile.city,
        experienceLevel: profile.experienceLevel,
        jobStatus: profile.jobStatus,
        currentPosition: profile.currentPosition,
        yearsOfExperience: profile.yearsOfExperience,
        summary: profile.professionalSummary,
        skills: profile.skills ? safeParseJson(profile.skills, []) : [],
        experiences: profile.experiences ? safeParseJson(profile.experiences, []) : [],
        education: profile.education ? safeParseJson(profile.education, null) : null,
        discResult: profile.discResult,
        hollandResult: profile.hollandResult,
        profilePhotoUrl: profile.profilePhotoUrl,
        resumeUrl: profile.resumeUrl,
        resumeFilename: profile.resumeFilename,
        username: profile.username,
        slug: profile.slug,
        isPublic: profile.isPublic,
        isActive: profile.isActive,
        completionPercentage: profile.completionPercentage,
        onboardingCompleted: profile.onboardingCompleted,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        // FocusedProfile v2 fields
        recentExperience: extras.recentExperience ?? null,
        coreSkills: Array.isArray(extras.coreSkills) ? extras.coreSkills : [],
        careerFocus: extras.careerFocus ?? null,
        latestEducation: extras.latestEducation ?? null,
        certifications: Array.isArray(extras.certifications) ? extras.certifications : [],
        personality: extras.personality ?? null,
        assessments: extras.assessments ?? null,
        profilePhotoThumbnailUrl: extras.profilePhotoThumbnailUrl ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پروفایل" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile - Update current user's profile
 */
export async function PUT(request: NextRequest) {
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
      firstName,
      lastName,
      email,
      phone,
      city,
      experienceLevel,
      jobStatus,
      currentPosition,
      yearsOfExperience,
      summary,
      skills,
      experiences,
      education,
      discResult,
      hollandResult,
      profilePhotoUrl,
      resumeUrl,
      resumeFilename,
      username,
      isPublic,
      recentExperience,
      coreSkills,
      careerFocus,
      latestEducation,
      certifications,
      personality,
      assessments,
      profilePhotoThumbnailUrl,
    } = body;

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (fullName !== undefined) updateData.fullName = fullName;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (jobStatus !== undefined) updateData.jobStatus = jobStatus;
    if (currentPosition !== undefined) updateData.currentPosition = currentPosition;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
    if (summary !== undefined) updateData.professionalSummary = summary;
    if (skills !== undefined) updateData.skills = JSON.stringify(skills);
    if (experiences !== undefined) updateData.experiences = JSON.stringify(experiences);
    if (education !== undefined) updateData.education = JSON.stringify(education);
    if (discResult !== undefined) updateData.discResult = discResult;
    if (hollandResult !== undefined) updateData.hollandResult = hollandResult;
    if (profilePhotoUrl !== undefined) updateData.profilePhotoUrl = profilePhotoUrl;
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
    if (resumeFilename !== undefined) updateData.resumeFilename = resumeFilename;
    if (username !== undefined) updateData.username = username;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Merge extras (FocusedProfile v2 fields stored in jsonb column)
    const existingExtras = (existingProfile.extras as Record<string, unknown> | null) || {};
    const extrasUpdate: Record<string, unknown> = { ...existingExtras };
    let extrasChanged = false;
    const extrasPairs: Array<[string, unknown]> = [
      ["recentExperience", recentExperience],
      ["coreSkills", coreSkills],
      ["careerFocus", careerFocus],
      ["latestEducation", latestEducation],
      ["certifications", certifications],
      ["personality", personality],
      ["assessments", assessments],
      ["profilePhotoThumbnailUrl", profilePhotoThumbnailUrl],
    ];
    for (const [key, value] of extrasPairs) {
      if (value !== undefined) {
        extrasUpdate[key] = value;
        extrasChanged = true;
      }
    }
    if (extrasChanged) {
      updateData.extras = extrasUpdate;
    }

    // Calculate completion percentage
    let completionScore = 0;
    const newSkills = skills ?? (existingProfile.skills ? safeParseJson(existingProfile.skills, []) : []);
    const newExperiences = experiences ?? (existingProfile.experiences ? safeParseJson(existingProfile.experiences, []) : []);
    const newEducation = education ?? (existingProfile.education ? safeParseJson(existingProfile.education, null) : null);

    if (fullName || existingProfile.fullName) completionScore += 10;
    if (city || existingProfile.city) completionScore += 10;
    if (experienceLevel || existingProfile.experienceLevel) completionScore += 10;
    if (jobStatus || existingProfile.jobStatus) completionScore += 10;
    if (newSkills.length >= 3) completionScore += 20;
    if (newExperiences.length >= 1) completionScore += 20;
    if (newEducation) completionScore += 10;
    if (summary || existingProfile.professionalSummary) completionScore += 10;

    updateData.completionPercentage = Math.min(completionScore, 100);
    updateData.onboardingCompleted = completionScore >= 60;

    // Update profile
    const [updated] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, existingProfile.id))
      .returning();

    const updatedExtras = (updated.extras as Record<string, unknown> | null) || {};

    return NextResponse.json({
      profile: {
        ...updated,
        skills: updated.skills ? safeParseJson(updated.skills, []) : [],
        experiences: updated.experiences ? safeParseJson(updated.experiences, []) : [],
        education: updated.education ? safeParseJson(updated.education, null) : null,
        recentExperience: updatedExtras.recentExperience ?? null,
        coreSkills: Array.isArray(updatedExtras.coreSkills) ? updatedExtras.coreSkills : [],
        careerFocus: updatedExtras.careerFocus ?? null,
        latestEducation: updatedExtras.latestEducation ?? null,
        certifications: Array.isArray(updatedExtras.certifications) ? updatedExtras.certifications : [],
        personality: updatedExtras.personality ?? null,
        assessments: updatedExtras.assessments ?? null,
        profilePhotoThumbnailUrl: updatedExtras.profilePhotoThumbnailUrl ?? null,
      },
      message: "پروفایل با موفقیت به‌روز شد",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پروفایل" },
      { status: 500 }
    );
  }
}
