import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { microcopyDefinitions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/microcopy/definitions - Get all microcopy definitions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const definitions = await db
      .select()
      .from(microcopyDefinitions)
      .orderBy(microcopyDefinitions.priority);

    return NextResponse.json({ definitions });
  } catch (error) {
    console.error("Error fetching microcopy definitions:", error);
    return NextResponse.json(
      { error: "خطا در دریافت تعاریف" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/microcopy/definitions - Create or update a microcopy definition
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      triggerRule,
      textFa,
      targetSegment,
      priority,
      cooldownHours,
      isEnabled,
    } = body;

    if (!id || !triggerRule || !textFa) {
      return NextResponse.json(
        { error: "id, triggerRule و textFa الزامی است" },
        { status: 400 }
      );
    }

    // Upsert
    const [definition] = await db
      .insert(microcopyDefinitions)
      .values({
        id,
        triggerRule,
        textFa,
        targetSegment: targetSegment || "all",
        priority: priority || 50,
        cooldownHours: cooldownHours || 24,
        isEnabled: isEnabled ?? true,
      })
      .onConflictDoUpdate({
        target: microcopyDefinitions.id,
        set: {
          triggerRule,
          textFa,
          targetSegment: targetSegment || "all",
          priority: priority || 50,
          cooldownHours: cooldownHours || 24,
          isEnabled: isEnabled ?? true,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({
      message: "Microcopy با موفقیت ذخیره شد",
      definition,
    });
  } catch (error) {
    console.error("Error saving microcopy definition:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره تعریف" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/microcopy/definitions - Toggle enable/disable
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const { id, isEnabled } = body;

    if (!id || typeof isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "id و isEnabled الزامی است" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(microcopyDefinitions)
      .set({
        isEnabled,
        updatedAt: new Date(),
      })
      .where(eq(microcopyDefinitions.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Microcopy یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: isEnabled ? "فعال شد" : "غیرفعال شد",
      definition: updated,
    });
  } catch (error) {
    console.error("Error toggling microcopy:", error);
    return NextResponse.json(
      { error: "خطا در تغییر وضعیت" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/microcopy/definitions - Delete a microcopy definition
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id الزامی است" }, { status: 400 });
    }

    await db
      .delete(microcopyDefinitions)
      .where(eq(microcopyDefinitions.id, id));

    return NextResponse.json({
      message: "Microcopy با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting microcopy:", error);
    return NextResponse.json(
      { error: "خطا در حذف" },
      { status: 500 }
    );
  }
}
