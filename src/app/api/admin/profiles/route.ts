import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles, assessments } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
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

    // Fetch all profiles with user data
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
        skills: profiles.skills,
        profilePhotoUrl: profiles.profilePhotoUrl,
        resumeUrl: profiles.resumeUrl,
        isPublic: profiles.isPublic,
        isActive: profiles.isActive,
        completionPercentage: profiles.completionPercentage,
        onboardingCompleted: profiles.onboardingCompleted,
        discResult: profiles.discResult,
        hollandResult: profiles.hollandResult,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
        // User data
        mobile: users.mobile,
        userIsVerified: users.isVerified,
        lastLogin: users.lastLogin,
      })
      .from(profiles)
      .leftJoin(users, eq(profiles.userId, users.id))
      .orderBy(desc(profiles.updatedAt));

    // Format profiles with skills count
    const formattedProfiles = allProfiles.map((profile) => {
      const skills = profile.skills ? JSON.parse(profile.skills) : [];
      return {
        ...profile,
        skillsCount: skills.length,
        hasPersonalityTest: !!profile.discResult || !!profile.hollandResult,
      };
    });

    // Get stats
    const stats = {
      total: allProfiles.length,
      active: allProfiles.filter((p) => p.isActive && p.isPublic).length,
      withNotes: 0, // We don't have notes yet, could add later
    };

    return NextResponse.json({
      profiles: formattedProfiles,
      count: allProfiles.length,
      stats,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30',
      }
    });
  } catch (error) {
    console.error("Error fetching admin profiles:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات پروفایل‌ها" },
      { status: 500 }
    );
  }
}
