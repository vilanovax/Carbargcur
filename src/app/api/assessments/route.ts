import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assessments, profiles } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/assessments - Get user's assessments
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Get user's profile
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "پروفایل یافت نشد" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'disc', 'holland', or null for all

    let query = db
      .select()
      .from(assessments)
      .where(eq(assessments.profileId, profile.id))
      .orderBy(desc(assessments.completedAt));

    if (type) {
      query = db
        .select()
        .from(assessments)
        .where(
          and(eq(assessments.profileId, profile.id), eq(assessments.type, type))
        )
        .orderBy(desc(assessments.completedAt));
    }

    const userAssessments = await query;

    return NextResponse.json({
      assessments: userAssessments.map((a) => ({
        id: a.id,
        type: a.type,
        primaryResult: a.primaryResult,
        secondaryResult: a.secondaryResult,
        scores: a.scores ? JSON.parse(a.scores) : null,
        completedAt: a.completedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "خطا در دریافت نتایج آزمون" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessments - Save assessment result
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Get user's profile
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "پروفایل یافت نشد" }, { status: 404 });
    }

    const body = await request.json();
    const { type, primaryResult, secondaryResult, scores } = body;

    // Validate required fields
    if (!type || !primaryResult) {
      return NextResponse.json(
        { error: "نوع آزمون و نتیجه اصلی الزامی است" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["disc", "holland"].includes(type)) {
      return NextResponse.json(
        { error: "نوع آزمون نامعتبر است" },
        { status: 400 }
      );
    }

    // Create new assessment
    const [newAssessment] = await db
      .insert(assessments)
      .values({
        profileId: profile.id,
        type,
        primaryResult,
        secondaryResult: secondaryResult || null,
        scores: scores ? JSON.stringify(scores) : null,
        completedAt: new Date(),
      })
      .returning();

    // Update profile with latest assessment result
    if (type === "disc") {
      await db
        .update(profiles)
        .set({
          discResult: primaryResult,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, profile.id));
    } else if (type === "holland") {
      await db
        .update(profiles)
        .set({
          hollandResult: primaryResult,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, profile.id));
    }

    return NextResponse.json(
      {
        assessment: {
          id: newAssessment.id,
          type: newAssessment.type,
          primaryResult: newAssessment.primaryResult,
          secondaryResult: newAssessment.secondaryResult,
          scores: scores || null,
          completedAt: newAssessment.completedAt,
        },
        message: "نتیجه آزمون با موفقیت ذخیره شد",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving assessment:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره نتیجه آزمون" },
      { status: 500 }
    );
  }
}
