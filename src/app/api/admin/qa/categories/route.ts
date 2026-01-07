import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qaCategories, users } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
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
 * GET /api/admin/qa/categories - List all categories
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const categories = await db
      .select()
      .from(qaCategories)
      .orderBy(asc(qaCategories.sortOrder));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/qa/categories - Create new category
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const { code, nameFa, nameEn, description, icon, sortOrder } = body;

    if (!code?.trim() || !nameFa?.trim()) {
      return NextResponse.json(
        { error: "کد و نام فارسی الزامی است" },
        { status: 400 }
      );
    }

    const [newCategory] = await db
      .insert(qaCategories)
      .values({
        code: code.trim().toLowerCase(),
        nameFa: nameFa.trim(),
        nameEn: nameEn?.trim() || null,
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        sortOrder: sortOrder || 0,
      })
      .returning();

    return NextResponse.json(
      { category: newCategory, message: "دسته‌بندی با موفقیت ایجاد شد" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "این کد قبلاً استفاده شده است" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "خطا در ایجاد دسته‌بندی" },
      { status: 500 }
    );
  }
}
