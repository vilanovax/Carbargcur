import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز - فقط ادمین‌ها" },
        { status: 403 }
      );
    }

    // Fetch all profiles
    const allProfiles = await db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        slug: profiles.slug,
        fullName: profiles.fullName,
        city: profiles.city,
        experienceLevel: profiles.experienceLevel,
        jobStatus: profiles.jobStatus,
        professionalSummary: profiles.professionalSummary,
        profilePhotoUrl: profiles.profilePhotoUrl,
        resumeUrl: profiles.resumeUrl,
        isPublic: profiles.isPublic,
        isActive: profiles.isActive,
        completionPercentage: profiles.completionPercentage,
        onboardingCompleted: profiles.onboardingCompleted,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      })
      .from(profiles)
      .orderBy(profiles.createdAt);

    return NextResponse.json({
      profiles: allProfiles,
      count: allProfiles.length,
    });
  } catch (error) {
    console.error("Error fetching admin profiles:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات پروفایل‌ها" },
      { status: 500 }
    );
  }
}
