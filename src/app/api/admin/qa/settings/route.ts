import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qaSettings, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Check if user is admin
 */
async function isAdmin(userId: string): Promise<boolean> {
  const [user] = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.isAdmin === true;
}

/**
 * GET /api/admin/qa/settings - Get all Q&A settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const settings = await db.select().from(qaSettings);

    // Convert to key-value object for easier use
    const settingsMap: Record<string, { value: string; description: string | null }> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = {
        value: setting.value,
        description: setting.description,
      };
    }

    return NextResponse.json({ settings: settingsMap, rawSettings: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/qa/settings - Update multiple settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "تنظیمات نامعتبر است" },
        { status: 400 }
      );
    }

    // Update each setting
    const updatedKeys: string[] = [];
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined && value !== null) {
        const [updated] = await db
          .update(qaSettings)
          .set({
            value: String(value),
            updatedBy: session.user.id,
            updatedAt: new Date(),
          })
          .where(eq(qaSettings.key, key))
          .returning();

        if (updated) {
          updatedKeys.push(key);
        }
      }
    }

    return NextResponse.json({
      message: "تنظیمات با موفقیت بروزرسانی شد",
      updatedKeys,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی تنظیمات" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/qa/settings - Create new setting
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, description } = body;

    if (!key?.trim() || value === undefined) {
      return NextResponse.json(
        { error: "کلید و مقدار الزامی است" },
        { status: 400 }
      );
    }

    const [newSetting] = await db
      .insert(qaSettings)
      .values({
        key: key.trim(),
        value: String(value),
        description: description?.trim() || null,
        updatedBy: session.user.id,
      })
      .returning();

    return NextResponse.json(
      { setting: newSetting, message: "تنظیم جدید با موفقیت ایجاد شد" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating setting:", error);
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "این کلید قبلاً وجود دارد" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "خطا در ایجاد تنظیم" },
      { status: 500 }
    );
  }
}
