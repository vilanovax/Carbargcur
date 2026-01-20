import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculatorConfigs, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { validateCalculatorConfig } from "@/lib/calculator-config";

/**
 * GET /api/admin/calculator-configs/[type]
 * دریافت تنظیمات یک calculator خاص (آخرین نسخه فعال)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin check
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { type } = params;

    if (!["salary", "tax", "loan"].includes(type)) {
      return NextResponse.json(
        { error: "نوع calculator معتبر نیست" },
        { status: 400 }
      );
    }

    // Get URL search params for year filter
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");

    // Build query
    const conditions = [eq(calculatorConfigs.calculatorType, type)];

    if (year) {
      conditions.push(eq(calculatorConfigs.configYear, parseInt(year)));
    }

    // Fetch configs for this type
    const configs = await db
      .select()
      .from(calculatorConfigs)
      .where(and(...conditions))
      .orderBy(desc(calculatorConfigs.configYear), desc(calculatorConfigs.updatedAt));

    return NextResponse.json({ configs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching calculator config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/calculator-configs/[type]
 * به‌روزرسانی تنظیمات calculator
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin check
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { type } = params;

    if (!["salary", "tax", "loan"].includes(type)) {
      return NextResponse.json(
        { error: "نوع calculator معتبر نیست" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      id,
      configYear,
      config,
      isActive,
      effectiveFrom,
      effectiveUntil,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "شناسه تنظیمات الزامی است" },
        { status: 400 }
      );
    }

    // Validate config if provided
    if (config) {
      const validation = validateCalculatorConfig(type as "salary" | "tax" | "loan", config);
      if (!validation.valid) {
        return NextResponse.json(
          { error: "تنظیمات نامعتبر", details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Update config
    const updateData: any = {
      updatedBy: session.user.id,
      updatedAt: new Date(),
    };

    if (config !== undefined) updateData.config = config;
    if (configYear !== undefined) updateData.configYear = configYear;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (effectiveFrom !== undefined) updateData.effectiveFrom = effectiveFrom ? new Date(effectiveFrom) : null;
    if (effectiveUntil !== undefined) updateData.effectiveUntil = effectiveUntil ? new Date(effectiveUntil) : null;
    if (notes !== undefined) updateData.notes = notes;

    const [updatedConfig] = await db
      .update(calculatorConfigs)
      .set(updateData)
      .where(
        and(
          eq(calculatorConfigs.id, id),
          eq(calculatorConfigs.calculatorType, type)
        )
      )
      .returning();

    if (!updatedConfig) {
      return NextResponse.json(
        { error: "تنظیمات پیدا نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ config: updatedConfig }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating calculator config:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "تنظیمات برای این calculator و سال قبلاً وجود دارد" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/calculator-configs/[type]
 * حذف تنظیمات calculator (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin check
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { type } = params;
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "شناسه تنظیمات الزامی است" },
        { status: 400 }
      );
    }

    if (!["salary", "tax", "loan"].includes(type)) {
      return NextResponse.json(
        { error: "نوع calculator معتبر نیست" },
        { status: 400 }
      );
    }

    // Soft delete: just mark as inactive
    const [deletedConfig] = await db
      .update(calculatorConfigs)
      .set({
        isActive: false,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(calculatorConfigs.id, id),
          eq(calculatorConfigs.calculatorType, type)
        )
      )
      .returning();

    if (!deletedConfig) {
      return NextResponse.json(
        { error: "تنظیمات پیدا نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "تنظیمات با موفقیت حذف شد", config: deletedConfig },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting calculator config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
