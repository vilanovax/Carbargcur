import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, answerReactions, userExpertiseStats, questions, profiles } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyAnswerReaction } from "@/lib/notifications";

/**
 * POST /api/qa/answers/[id]/react - React to an answer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id: answerId } = await params;
    const body = await request.json();
    const { type } = body; // 'helpful' or 'expert'

    // Validate type
    if (!["helpful", "expert"].includes(type)) {
      return NextResponse.json(
        { error: "نوع واکنش نامعتبر است" },
        { status: 400 }
      );
    }

    // Check answer exists
    const [answer] = await db
      .select()
      .from(answers)
      .where(and(eq(answers.id, answerId), eq(answers.isHidden, false)))
      .limit(1);

    if (!answer) {
      return NextResponse.json(
        { error: "پاسخ یافت نشد" },
        { status: 404 }
      );
    }

    // Prevent self-reaction
    if (answer.authorId === session.user.id) {
      return NextResponse.json(
        { error: "نمی‌توانید به پاسخ خودتان واکنش دهید" },
        { status: 400 }
      );
    }

    // Check if user already reacted
    const [existingReaction] = await db
      .select()
      .from(answerReactions)
      .where(
        and(
          eq(answerReactions.answerId, answerId),
          eq(answerReactions.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingReaction) {
      // If same type, remove reaction (toggle)
      if (existingReaction.type === type) {
        await db
          .delete(answerReactions)
          .where(eq(answerReactions.id, existingReaction.id));

        // Decrease count
        const updateField =
          type === "helpful"
            ? { helpfulCount: sql`GREATEST(${answers.helpfulCount} - 1, 0)` }
            : { expertBadgeCount: sql`GREATEST(${answers.expertBadgeCount} - 1, 0)` };

        await db
          .update(answers)
          .set({ ...updateField, updatedAt: new Date() })
          .where(eq(answers.id, answerId));

        // Update author's expertise stats (decrease)
        await updateExpertiseStats(answer.authorId, type, "decrease");

        return NextResponse.json({
          action: "removed",
          message: "واکنش حذف شد",
        });
      }

      // Different type: update reaction
      await db
        .update(answerReactions)
        .set({ type })
        .where(eq(answerReactions.id, existingReaction.id));

      // Update counts (decrease old, increase new)
      const oldField =
        existingReaction.type === "helpful"
          ? { helpfulCount: sql`GREATEST(${answers.helpfulCount} - 1, 0)` }
          : { expertBadgeCount: sql`GREATEST(${answers.expertBadgeCount} - 1, 0)` };

      const newField =
        type === "helpful"
          ? { helpfulCount: sql`${answers.helpfulCount} + 1` }
          : { expertBadgeCount: sql`${answers.expertBadgeCount} + 1` };

      await db
        .update(answers)
        .set({ ...oldField, ...newField, updatedAt: new Date() })
        .where(eq(answers.id, answerId));

      // Update author's expertise stats
      await updateExpertiseStats(answer.authorId, existingReaction.type, "decrease");
      await updateExpertiseStats(answer.authorId, type, "increase");

      return NextResponse.json({
        action: "changed",
        newType: type,
        message: "واکنش تغییر کرد",
      });
    }

    // New reaction
    await db.insert(answerReactions).values({
      answerId,
      userId: session.user.id,
      type,
    });

    // Increase count
    const updateField =
      type === "helpful"
        ? { helpfulCount: sql`${answers.helpfulCount} + 1` }
        : { expertBadgeCount: sql`${answers.expertBadgeCount} + 1` };

    await db
      .update(answers)
      .set({ ...updateField, updatedAt: new Date() })
      .where(eq(answers.id, answerId));

    // Update author's expertise stats
    await updateExpertiseStats(answer.authorId, type, "increase");

    // Send notification to answer author for new reactions
    try {
      // Get reactor's name
      const [reactorProfile] = await db
        .select({ fullName: profiles.fullName })
        .from(profiles)
        .where(eq(profiles.userId, session.user.id))
        .limit(1);

      // Get the question for title
      const [question] = await db
        .select({ id: questions.id, title: questions.title })
        .from(questions)
        .where(eq(questions.id, answer.questionId))
        .limit(1);

      if (question) {
        await notifyAnswerReaction({
          answerAuthorId: answer.authorId,
          reactorName: reactorProfile?.fullName || session.user.fullName || "کاربر",
          reactionType: type as "helpful" | "expert",
          questionId: question.id,
          questionTitle: question.title,
        });
      }
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      action: "added",
      type,
      message: type === "helpful" ? "مفید بود ثبت شد" : "پاسخ متخصصانه ثبت شد",
    });
  } catch (error) {
    console.error("Error reacting to answer:", error);
    return NextResponse.json(
      { error: "خطا در ثبت واکنش" },
      { status: 500 }
    );
  }
}

// Helper function to update expertise stats
async function updateExpertiseStats(
  userId: string,
  reactionType: string,
  action: "increase" | "decrease"
) {
  try {
    const [existing] = await db
      .select()
      .from(userExpertiseStats)
      .where(eq(userExpertiseStats.userId, userId))
      .limit(1);

    const delta = action === "increase" ? 1 : -1;

    if (existing) {
      const updateData: Record<string, unknown> = { updatedAt: new Date() };

      if (reactionType === "helpful") {
        updateData.helpfulReactions = sql`GREATEST(${userExpertiseStats.helpfulReactions} + ${delta}, 0)`;
      } else {
        updateData.expertReactions = sql`GREATEST(${userExpertiseStats.expertReactions} + ${delta}, 0)`;
      }

      await db
        .update(userExpertiseStats)
        .set(updateData)
        .where(eq(userExpertiseStats.userId, userId));
    } else if (action === "increase") {
      await db.insert(userExpertiseStats).values({
        userId,
        helpfulReactions: reactionType === "helpful" ? 1 : 0,
        expertReactions: reactionType === "expert" ? 1 : 0,
      });
    }
  } catch (error) {
    console.error("Error updating expertise stats:", error);
  }
}
