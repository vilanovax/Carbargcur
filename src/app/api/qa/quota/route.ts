import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, qaSettings } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/api/auth";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayIso = todayStart.toISOString();

    const [settingRow, countRow] = await Promise.all([
      db
        .select({ value: qaSettings.value })
        .from(qaSettings)
        .where(eq(qaSettings.key, "daily_question_limit"))
        .limit(1),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(questions)
        .where(
          and(
            eq(questions.authorId, auth.userId),
            sql`${questions.createdAt} >= ${todayIso}::timestamp`
          )
        ),
    ]);

    const limit = parseInt(settingRow[0]?.value || "5");
    const used = countRow[0]?.count ?? 0;
    const remaining = Math.max(0, limit - used);

    return NextResponse.json(
      { used, limit, remaining },
      {
        headers: { "Cache-Control": "private, max-age=30" },
      }
    );
  } catch (error) {
    console.error("Error fetching QA quota:", error);
    return NextResponse.json({ error: "خطا در دریافت محدودیت" }, { status: 500 });
  }
}
