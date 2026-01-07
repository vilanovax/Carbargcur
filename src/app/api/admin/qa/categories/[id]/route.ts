import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qaCategories, users } from "@/lib/db/schema";
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
 * GET /api/admin/qa/categories/[id] - Get single category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;

    const [category] = await db
      .select()
      .from(qaCategories)
      .where(eq(qaCategories.id, id))
      .limit(1);

    if (!category) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/qa/categories/[id] - Update category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nameFa, nameEn, description, icon, sortOrder, isActive } = body;

    // Build update object
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (nameFa !== undefined) updates.nameFa = nameFa.trim();
    if (nameEn !== undefined) updates.nameEn = nameEn?.trim() || null;
    if (description !== undefined) updates.description = description?.trim() || null;
    if (icon !== undefined) updates.icon = icon?.trim() || null;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db
      .update(qaCategories)
      .set(updates)
      .where(eq(qaCategories.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: updated,
      message: "دسته‌بندی با موفقیت بروزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی دسته‌بندی" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/qa/categories/[id] - Delete category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;

    const [deleted] = await db
      .delete(qaCategories)
      .where(eq(qaCategories.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "دسته‌بندی با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "خطا در حذف دسته‌بندی" },
      { status: 500 }
    );
  }
}
