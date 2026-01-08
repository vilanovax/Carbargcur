import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { microcopyActions, microcopyEvents } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/microcopy/actions - Record an action linked to a microcopy event
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const body = await request.json();
    const {
      microcopyEventId,
      actionType,
      answerId,
      questionId,
      reputationDelta,
      timeToActionMs,
    } = body;

    // Validate required fields
    if (!microcopyEventId || !actionType) {
      return NextResponse.json(
        { error: "microcopyEventId و actionType الزامی است" },
        { status: 400 }
      );
    }

    // Validate actionType
    const validActionTypes = [
      "answer_created",
      "question_created",
      "profile_viewed",
      "leaderboard_viewed",
    ];
    if (!validActionTypes.includes(actionType)) {
      return NextResponse.json(
        { error: "نوع اقدام نامعتبر است" },
        { status: 400 }
      );
    }

    // Verify the microcopy event exists
    const [event] = await db
      .select()
      .from(microcopyEvents)
      .where(eq(microcopyEvents.id, microcopyEventId))
      .limit(1);

    if (!event) {
      return NextResponse.json(
        { error: "رویداد Microcopy یافت نشد" },
        { status: 404 }
      );
    }

    // Record the action
    const [action] = await db
      .insert(microcopyActions)
      .values({
        microcopyEventId,
        userId,
        actionType,
        answerId,
        questionId,
        reputationDelta: reputationDelta || 0,
        timeToActionMs,
      })
      .returning();

    return NextResponse.json({
      actionId: action.id,
      success: true,
    });
  } catch (error) {
    console.error("Error recording microcopy action:", error);
    return NextResponse.json(
      { error: "خطا در ثبت اقدام" },
      { status: 500 }
    );
  }
}
