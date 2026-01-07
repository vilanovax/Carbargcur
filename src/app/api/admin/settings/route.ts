import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { adminSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/settings - Get all admin settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    // Get all settings
    const settings = await db.select().from(adminSettings);

    // Convert array to object for easier access
    const settingsObj = settings.reduce((acc: any, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
      };
      return acc;
    }, {});

    return NextResponse.json(settingsObj, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      }
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تنظیمات' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Update a setting
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, value, description } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'کلید تنظیمات الزامی است' },
        { status: 400 }
      );
    }

    // Check if setting exists
    const existingSetting = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.key, key))
      .limit(1);

    if (existingSetting.length > 0) {
      // Update existing setting
      await db
        .update(adminSettings)
        .set({
          value,
          description,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(adminSettings.key, key));
    } else {
      // Create new setting
      await db.insert(adminSettings).values({
        key,
        value,
        description,
        isEncrypted: false,
        updatedBy: session.user.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تنظیمات با موفقیت ذخیره شد',
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json(
      { error: 'خطا در ذخیره تنظیمات' },
      { status: 500 }
    );
  }
}
