import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  microcopyEvents,
  microcopyActions,
  userMicrocopyCooldowns,
  answers,
} from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/microcopy/events - Record a microcopy event
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const body = await request.json();
    const {
      microcopyId,
      triggerRuleId,
      eventType,
      pageUrl,
      questionId,
      metadata,
    } = body;

    // Validate required fields
    if (!microcopyId || !eventType) {
      return NextResponse.json(
        { error: "microcopyId و eventType الزامی است" },
        { status: 400 }
      );
    }

    // Validate eventType
    const validEventTypes = ["shown", "clicked", "dismissed"];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: "نوع رویداد نامعتبر است" },
        { status: 400 }
      );
    }

    // Calculate user segment
    let userSegment: "new" | "junior" | "senior" = "new";
    let userAnswerCount = 0;

    if (userId) {
      // Get user's answer count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(answers)
        .where(and(eq(answers.authorId, userId), eq(answers.isHidden, false)));

      userAnswerCount = countResult?.count || 0;

      if (userAnswerCount === 0) {
        userSegment = "new";
      } else if (userAnswerCount <= 5) {
        userSegment = "junior";
      } else {
        userSegment = "senior";
      }
    }

    // Record the event
    const [event] = await db
      .insert(microcopyEvents)
      .values({
        microcopyId,
        triggerRuleId,
        userId,
        eventType,
        pageUrl,
        questionId,
        userSegment,
        userAnswerCount,
        metadata,
      })
      .returning();

    // Update cooldown if event is "shown"
    if (eventType === "shown" && userId) {
      await db
        .insert(userMicrocopyCooldowns)
        .values({
          userId,
          microcopyId,
          lastShownAt: new Date(),
          showCount: 1,
        })
        .onConflictDoUpdate({
          target: [userMicrocopyCooldowns.userId, userMicrocopyCooldowns.microcopyId],
          set: {
            lastShownAt: new Date(),
            showCount: sql`${userMicrocopyCooldowns.showCount} + 1`,
          },
        });
    }

    return NextResponse.json({
      eventId: event.id,
      userSegment,
    });
  } catch (error) {
    console.error("Error recording microcopy event:", error);
    return NextResponse.json(
      { error: "خطا در ثبت رویداد" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/microcopy/events - Get user's recent microcopy events (for cooldown check)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ cooldowns: {} });
    }

    const userId = session.user.id;

    // Get user's cooldowns
    const cooldowns = await db
      .select()
      .from(userMicrocopyCooldowns)
      .where(eq(userMicrocopyCooldowns.userId, userId));

    // Convert to map
    const cooldownMap: Record<string, { lastShownAt: string; showCount: number }> = {};
    for (const c of cooldowns) {
      cooldownMap[c.microcopyId] = {
        lastShownAt: c.lastShownAt.toISOString(),
        showCount: c.showCount,
      };
    }

    return NextResponse.json({ cooldowns: cooldownMap });
  } catch (error) {
    console.error("Error fetching cooldowns:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات" },
      { status: 500 }
    );
  }
}
