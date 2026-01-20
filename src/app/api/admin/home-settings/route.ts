import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { homeSettings, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET - دریافت تنظیمات Home
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get settings (should be only one row)
    const [settings] = await db.select().from(homeSettings).limit(1);

    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    console.error("Error fetching home settings:", error);
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات" },
      { status: 500 }
    );
  }
}

// PUT - ویرایش تنظیمات Home
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      heroTitle,
      heroSubtitle,
      heroBadgeText,
      stats,
      recentQuestions,
    } = body;

    // Check if settings exist
    const [existingSettings] = await db.select().from(homeSettings).limit(1);

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
      updatedBy: session.user.id,
    };

    if (heroTitle !== undefined) updateData.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle;
    if (heroBadgeText !== undefined) updateData.heroBadgeText = heroBadgeText;
    if (stats !== undefined) updateData.stats = stats;
    if (recentQuestions !== undefined) updateData.recentQuestions = recentQuestions;

    let result;

    if (existingSettings) {
      // Update existing
      [result] = await db
        .update(homeSettings)
        .set(updateData)
        .where(eq(homeSettings.id, existingSettings.id))
        .returning();
    } else {
      // Create new
      [result] = await db
        .insert(homeSettings)
        .values(updateData)
        .returning();
    }

    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error("Error updating home settings:", error);
    return NextResponse.json(
      { error: "خطا در ویرایش تنظیمات" },
      { status: 500 }
    );
  }
}
