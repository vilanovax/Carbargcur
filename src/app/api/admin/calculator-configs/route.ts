import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculatorConfigs, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { validateCalculatorConfig } from "@/lib/calculator-config";

/**
 * GET /api/admin/calculator-configs
 * دریافت لیست تمام تنظیمات calculator ها
 */
export async function GET(request: NextRequest) {
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

    // Fetch all calculator configs
    const configs = await db
      .select()
      .from(calculatorConfigs)
      .orderBy(desc(calculatorConfigs.updatedAt));

    return NextResponse.json({ configs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching calculator configs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/calculator-configs
 * ایجاد یا به‌روزرسانی تنظیمات calculator
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {
      calculatorType,
      configYear,
      config,
      isActive,
      effectiveFrom,
      effectiveUntil,
      notes,
    } = body;

    // Validation
    if (!calculatorType || !["salary", "tax", "loan"].includes(calculatorType)) {
      return NextResponse.json(
        { error: "نوع calculator معتبر نیست" },
        { status: 400 }
      );
    }

    if (!configYear || configYear < 1400) {
      return NextResponse.json(
        { error: "سال باید بزرگتر از ۱۴۰۰ باشد" },
        { status: 400 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { error: "تنظیمات calculator الزامی است" },
        { status: 400 }
      );
    }

    // Validate config structure
    const validation = validateCalculatorConfig(calculatorType, config);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "تنظیمات نامعتبر", details: validation.errors },
        { status: 400 }
      );
    }

    // Insert new config
    const [newConfig] = await db
      .insert(calculatorConfigs)
      .values({
        calculatorType,
        configYear,
        config,
        isActive: isActive ?? true,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : null,
        effectiveUntil: effectiveUntil ? new Date(effectiveUntil) : null,
        notes,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ config: newConfig }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating calculator config:", error);

    // Check for unique constraint violation
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
