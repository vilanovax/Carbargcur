import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recomputeAnswerQuality } from "@/services/answerQuality.service";

/**
 * PUT /api/qa/answers/[id]
 * Edit an answer (only by the author)
 */
export async function PUT(
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
    const { body: newBody } = body;

    // Validate body
    if (!newBody || typeof newBody !== "string") {
      return NextResponse.json(
        { error: "متن پاسخ الزامی است" },
        { status: 400 }
      );
    }

    const trimmedBody = newBody.trim();
    if (trimmedBody.length < 20) {
      return NextResponse.json(
        { error: "پاسخ باید حداقل ۲۰ کاراکتر باشد" },
        { status: 400 }
      );
    }

    if (trimmedBody.length > 10000) {
      return NextResponse.json(
        { error: "پاسخ نمی‌تواند بیش از ۱۰,۰۰۰ کاراکتر باشد" },
        { status: 400 }
      );
    }

    // Get the answer
    const [answer] = await db
      .select()
      .from(answers)
      .where(eq(answers.id, answerId))
      .limit(1);

    if (!answer) {
      return NextResponse.json({ error: "پاسخ یافت نشد" }, { status: 404 });
    }

    // Check ownership
    if (answer.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "فقط نویسنده می‌تواند پاسخ را ویرایش کند" },
        { status: 403 }
      );
    }

    // Check if answer is hidden
    if (answer.isHidden) {
      return NextResponse.json(
        { error: "این پاسخ قابل ویرایش نیست" },
        { status: 400 }
      );
    }

    // Update the answer
    const [updatedAnswer] = await db
      .update(answers)
      .set({
        body: trimmedBody,
        updatedAt: new Date(),
      })
      .where(eq(answers.id, answerId))
      .returning();

    // Recompute AQS after edit (content may have changed)
    await recomputeAnswerQuality(answerId, "EDIT");

    return NextResponse.json({
      message: "پاسخ با موفقیت ویرایش شد",
      answer: {
        id: updatedAnswer.id,
        body: updatedAnswer.body,
        updatedAt: updatedAnswer.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating answer:", error);
    return NextResponse.json(
      { error: "خطا در ویرایش پاسخ" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/qa/answers/[id]
 * Delete an answer (soft delete - only by author or admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id: answerId } = await params;

    // Get the answer
    const [answer] = await db
      .select()
      .from(answers)
      .where(eq(answers.id, answerId))
      .limit(1);

    if (!answer) {
      return NextResponse.json({ error: "پاسخ یافت نشد" }, { status: 404 });
    }

    // Check ownership or admin
    const isOwner = answer.authorId === session.user.id;
    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // Soft delete - hide the answer
    await db
      .update(answers)
      .set({
        isHidden: true,
        updatedAt: new Date(),
      })
      .where(eq(answers.id, answerId));

    return NextResponse.json({
      message: "پاسخ با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting answer:", error);
    return NextResponse.json(
      { error: "خطا در حذف پاسخ" },
      { status: 500 }
    );
  }
}
