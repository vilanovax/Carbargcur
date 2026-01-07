import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";

/**
 * GET /api/public/profile/[slug] - Get public profile by slug or username
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find profile by slug or username
    const [profile] = await db
      .select()
      .from(profiles)
      .where(
        and(
          or(eq(profiles.slug, slug), eq(profiles.username, slug)),
          eq(profiles.isActive, true),
          eq(profiles.isPublic, true)
        )
      )
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: "پروفایل یافت نشد" },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const skills = profile.skills ? JSON.parse(profile.skills) : [];
    const experiences = profile.experiences ? JSON.parse(profile.experiences) : [];
    const education = profile.education ? JSON.parse(profile.education) : null;

    return NextResponse.json({
      profile: {
        userId: profile.userId,
        slug: profile.slug,
        fullName: profile.fullName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city,
        experienceLevel: profile.experienceLevel,
        jobStatus: profile.jobStatus,
        currentPosition: profile.currentPosition,
        yearsOfExperience: profile.yearsOfExperience,
        professionalSummary: profile.professionalSummary,
        skills,
        experiences,
        education,
        discResult: profile.discResult,
        hollandResult: profile.hollandResult,
        profilePhotoUrl: profile.profilePhotoUrl,
        resumeUrl: profile.resumeUrl,
        resumeFilename: profile.resumeFilename,
        completionPercentage: profile.completionPercentage,
      },
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پروفایل" },
      { status: 500 }
    );
  }
}
