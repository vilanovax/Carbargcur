import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/api/auth";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    // Fetch all users with their profiles
    const allUsers = await db
      .select({
        id: users.id,
        mobile: users.mobile,
        fullName: users.fullName,
        isVerified: users.isVerified,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
        profileId: profiles.id,
        profileFullName: profiles.fullName,
        profileSlug: profiles.slug,
        profileCity: profiles.city,
        profileIsPublic: profiles.isPublic,
        profileIsActive: profiles.isActive,
        completionPercentage: profiles.completionPercentage,
        onboardingCompleted: profiles.onboardingCompleted,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(users.createdAt);

    // Calculate stats
    const totalUsers = allUsers.length;
    const profileStarted = allUsers.filter((u) => u.profileId !== null).length;
    const completeProfiles = allUsers.filter(
      (u) => u.onboardingCompleted === true
    ).length;
    const activePublicProfiles = allUsers.filter(
      (u) => u.profileIsPublic === true && u.profileIsActive === true
    ).length;

    return NextResponse.json({
      users: allUsers,
      stats: {
        totalUsers,
        profileStarted,
        completeProfiles,
        activePublicProfiles,
      },
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30', // Cache for 30 seconds
      }
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات کاربران" },
      { status: 500 }
    );
  }
}
