import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  microcopyEvents,
  microcopyActions,
  microcopyDefinitions,
} from "@/lib/db/schema";
import { eq, and, gte, sql, desc, count } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/microcopy/stats - Get microcopy performance dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Check admin status
    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Get time range from query params (default: 7 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // ═══════════════════════════════════════════════════════════════
    // 1. Global KPIs
    // ═══════════════════════════════════════════════════════════════

    // Total shown events
    const [totalShown] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(microcopyEvents)
      .where(
        and(
          eq(microcopyEvents.eventType, "shown"),
          gte(microcopyEvents.createdAt, startDate)
        )
      );

    // Total clicked events
    const [totalClicked] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(microcopyEvents)
      .where(
        and(
          eq(microcopyEvents.eventType, "clicked"),
          gte(microcopyEvents.createdAt, startDate)
        )
      );

    // Total actions (conversions)
    const [totalActions] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(microcopyActions)
      .where(gte(microcopyActions.createdAt, startDate));

    // Average time to action
    const [avgTimeResult] = await db
      .select({
        avgTime: sql<number>`AVG(${microcopyActions.timeToActionMs})::int`,
      })
      .from(microcopyActions)
      .where(
        and(
          gte(microcopyActions.createdAt, startDate),
          sql`${microcopyActions.timeToActionMs} IS NOT NULL`
        )
      );

    // Average reputation lift
    const [avgRepResult] = await db
      .select({
        avgRep: sql<number>`COALESCE(AVG(${microcopyActions.reputationDelta}), 0)::numeric(10,2)`,
      })
      .from(microcopyActions)
      .where(gte(microcopyActions.createdAt, startDate));

    // Fatigue rate (shown > 5 times with no action)
    const [fatigueResult] = await db
      .select({
        total: sql<number>`count(DISTINCT ${microcopyEvents.userId})::int`,
        fatigued: sql<number>`count(DISTINCT CASE
          WHEN NOT EXISTS (
            SELECT 1 FROM ${microcopyActions} ma
            WHERE ma.microcopy_event_id = ${microcopyEvents.id}
          ) THEN ${microcopyEvents.userId}
        END)::int`,
      })
      .from(microcopyEvents)
      .where(
        and(
          eq(microcopyEvents.eventType, "shown"),
          gte(microcopyEvents.createdAt, startDate)
        )
      );

    const shownCount = totalShown?.count || 0;
    const clickedCount = totalClicked?.count || 0;
    const actionsCount = totalActions?.count || 0;

    const ctr = shownCount > 0 ? (clickedCount / shownCount) : 0;
    const conversion = shownCount > 0 ? (actionsCount / shownCount) : 0;
    const avgTimeMs = avgTimeResult?.avgTime || 0;
    const avgTimeFormatted = avgTimeMs > 0
      ? `${Math.floor(avgTimeMs / 60000)}m ${Math.floor((avgTimeMs % 60000) / 1000)}s`
      : "N/A";

    const fatigueRate = fatigueResult?.total > 0
      ? fatigueResult.fatigued / fatigueResult.total
      : 0;

    // ═══════════════════════════════════════════════════════════════
    // 2. Per-Microcopy Performance Table
    // ═══════════════════════════════════════════════════════════════

    const perMicrocopyStats = await db
      .select({
        microcopyId: microcopyEvents.microcopyId,
        triggerRule: microcopyEvents.triggerRuleId,
        views: sql<number>`count(CASE WHEN ${microcopyEvents.eventType} = 'shown' THEN 1 END)::int`,
        clicks: sql<number>`count(CASE WHEN ${microcopyEvents.eventType} = 'clicked' THEN 1 END)::int`,
      })
      .from(microcopyEvents)
      .where(gte(microcopyEvents.createdAt, startDate))
      .groupBy(microcopyEvents.microcopyId, microcopyEvents.triggerRuleId)
      .orderBy(desc(sql`count(CASE WHEN ${microcopyEvents.eventType} = 'shown' THEN 1 END)`));

    // Get action counts per microcopy
    const actionsPerMicrocopy = await db
      .select({
        microcopyId: microcopyEvents.microcopyId,
        actionCount: sql<number>`count(${microcopyActions.id})::int`,
        avgRepDelta: sql<number>`COALESCE(AVG(${microcopyActions.reputationDelta}), 0)::numeric(10,1)`,
      })
      .from(microcopyActions)
      .innerJoin(microcopyEvents, eq(microcopyActions.microcopyEventId, microcopyEvents.id))
      .where(gte(microcopyActions.createdAt, startDate))
      .groupBy(microcopyEvents.microcopyId);

    const actionsMap: Record<string, { actionCount: number; avgRepDelta: number }> = {};
    for (const a of actionsPerMicrocopy) {
      actionsMap[a.microcopyId] = {
        actionCount: a.actionCount,
        avgRepDelta: Number(a.avgRepDelta),
      };
    }

    // Get definitions for cooldown info
    const definitions = await db.select().from(microcopyDefinitions);
    const defMap: Record<string, { cooldownHours: number; isEnabled: boolean }> = {};
    for (const d of definitions) {
      defMap[d.id] = {
        cooldownHours: d.cooldownHours,
        isEnabled: d.isEnabled,
      };
    }

    const microcopyTable = perMicrocopyStats.map((m) => {
      const actions = actionsMap[m.microcopyId] || { actionCount: 0, avgRepDelta: 0 };
      const def = defMap[m.microcopyId] || { cooldownHours: 24, isEnabled: true };
      const ctrValue = m.views > 0 ? (m.clicks / m.views) : 0;
      const convValue = m.views > 0 ? (actions.actionCount / m.views) : 0;

      // Status: 🟢 CTR > 30%, 🟡 CTR 15-30%, 🔴 CTR < 15%
      let status: "green" | "yellow" | "red" = "green";
      if (ctrValue < 0.15) status = "red";
      else if (ctrValue < 0.30) status = "yellow";

      return {
        microcopyId: m.microcopyId,
        triggerRule: m.triggerRule || "N/A",
        views: m.views,
        ctr: Math.round(ctrValue * 100),
        conversion: Math.round(convValue * 100),
        avgRepPlus: actions.avgRepDelta,
        cooldown: `${def.cooldownHours}h`,
        status,
        isEnabled: def.isEnabled,
      };
    });

    // ═══════════════════════════════════════════════════════════════
    // 3. Segment Analysis
    // ═══════════════════════════════════════════════════════════════

    const segmentStats = await db
      .select({
        microcopyId: microcopyEvents.microcopyId,
        userSegment: microcopyEvents.userSegment,
        views: sql<number>`count(CASE WHEN ${microcopyEvents.eventType} = 'shown' THEN 1 END)::int`,
        clicks: sql<number>`count(CASE WHEN ${microcopyEvents.eventType} = 'clicked' THEN 1 END)::int`,
      })
      .from(microcopyEvents)
      .where(
        and(
          gte(microcopyEvents.createdAt, startDate),
          sql`${microcopyEvents.userSegment} IS NOT NULL`
        )
      )
      .groupBy(microcopyEvents.microcopyId, microcopyEvents.userSegment);

    // Get actions per segment
    const actionsPerSegment = await db
      .select({
        microcopyId: microcopyEvents.microcopyId,
        userSegment: microcopyEvents.userSegment,
        actionCount: sql<number>`count(${microcopyActions.id})::int`,
      })
      .from(microcopyActions)
      .innerJoin(microcopyEvents, eq(microcopyActions.microcopyEventId, microcopyEvents.id))
      .where(
        and(
          gte(microcopyActions.createdAt, startDate),
          sql`${microcopyEvents.userSegment} IS NOT NULL`
        )
      )
      .groupBy(microcopyEvents.microcopyId, microcopyEvents.userSegment);

    const segmentActionsMap: Record<string, Record<string, number>> = {};
    for (const a of actionsPerSegment) {
      if (!segmentActionsMap[a.microcopyId]) segmentActionsMap[a.microcopyId] = {};
      segmentActionsMap[a.microcopyId][a.userSegment || "unknown"] = a.actionCount;
    }

    // Build segment analysis
    const segmentAnalysis: Record<string, Record<string, { ctr: number; conversion: number }>> = {};
    for (const s of segmentStats) {
      const segment = s.userSegment || "unknown";
      if (!segmentAnalysis[s.microcopyId]) segmentAnalysis[s.microcopyId] = {};

      const actions = segmentActionsMap[s.microcopyId]?.[segment] || 0;

      segmentAnalysis[s.microcopyId][segment] = {
        ctr: s.views > 0 ? Math.round((s.clicks / s.views) * 100) : 0,
        conversion: s.views > 0 ? Math.round((actions / s.views) * 100) : 0,
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. Funnel Data (Example for top microcopy)
    // ═══════════════════════════════════════════════════════════════

    const topMicrocopyId = microcopyTable[0]?.microcopyId;
    let funnel = null;

    if (topMicrocopyId) {
      const [funnelShown] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(microcopyEvents)
        .where(
          and(
            eq(microcopyEvents.microcopyId, topMicrocopyId),
            eq(microcopyEvents.eventType, "shown"),
            gte(microcopyEvents.createdAt, startDate)
          )
        );

      const [funnelClicked] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(microcopyEvents)
        .where(
          and(
            eq(microcopyEvents.microcopyId, topMicrocopyId),
            eq(microcopyEvents.eventType, "clicked"),
            gte(microcopyEvents.createdAt, startDate)
          )
        );

      const [funnelActions] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(microcopyActions)
        .innerJoin(microcopyEvents, eq(microcopyActions.microcopyEventId, microcopyEvents.id))
        .where(
          and(
            eq(microcopyEvents.microcopyId, topMicrocopyId),
            gte(microcopyActions.createdAt, startDate)
          )
        );

      funnel = {
        microcopyId: topMicrocopyId,
        shown: funnelShown?.count || 0,
        clicked: funnelClicked?.count || 0,
        actions: funnelActions?.count || 0,
      };
    }

    return NextResponse.json({
      // Global KPIs
      kpis: {
        ctr: Math.round(ctr * 100),
        conversion: Math.round(conversion * 100),
        avgTimeToAction: avgTimeFormatted,
        avgReputationLift: Number(avgRepResult?.avgRep || 0),
        fatigueRate: Math.round(fatigueRate * 100),
      },
      // Per-Microcopy Table
      microcopyTable,
      // Segment Analysis
      segmentAnalysis,
      // Funnel (for top microcopy)
      funnel,
      // Meta
      meta: {
        days,
        totalShown: shownCount,
        totalClicked: clickedCount,
        totalActions: actionsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching microcopy stats:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آمار" },
      { status: 500 }
    );
  }
}
