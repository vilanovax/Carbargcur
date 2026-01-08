import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questionBookmarks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/bookmarks/check?questionId=xxx - Check if a question is bookmarked
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isBookmarked: false });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "شناسه سؤال الزامی است" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: questionBookmarks.id })
      .from(questionBookmarks)
      .where(
        and(
          eq(questionBookmarks.userId, session.user.id),
          eq(questionBookmarks.questionId, questionId)
        )
      )
      .limit(1);

    return NextResponse.json({
      isBookmarked: !!existing,
      bookmarkId: existing?.id || null,
    });
  } catch (error) {
    console.error("Error checking bookmark:", error);
    return NextResponse.json({ isBookmarked: false });
  }
}
