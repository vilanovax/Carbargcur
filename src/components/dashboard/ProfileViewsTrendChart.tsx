"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getRecentEvents, getMockViewData } from "@/lib/profileEvents";
import type { ProfileEvent } from "@/lib/profileEvents";

interface WeeklyData {
  week: string;
  views: number;
  events: ProfileEvent[];
}

// Generate mock weekly view data for last 3 weeks
function generateWeeklyViewData(): WeeklyData[] {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  // Get all events from last 3 weeks
  const allEvents = getRecentEvents(24 * 7 * 3); // 3 weeks

  const weeks: WeeklyData[] = [];

  for (let i = 2; i >= 0; i--) {
    const weekStart = now - (i + 1) * oneWeek;
    const weekEnd = now - i * oneWeek;

    // Filter events for this week
    const weekEvents = allEvents.filter(
      (event) => event.timestamp >= weekStart && event.timestamp < weekEnd
    );

    // Generate mock views (baseline + boost from events)
    const baselineViews = Math.floor(Math.random() * 10) + 5; // 5-15 base
    const eventBoost = weekEvents.length * 3; // +3 views per event
    const views = baselineViews + eventBoost;

    // Week label
    const weeksAgo = i === 0 ? "این هفته" : i === 1 ? "هفته گذشته" : `${i + 1} هفته پیش`;

    weeks.push({
      week: weeksAgo,
      views,
      events: weekEvents,
    });
  }

  return weeks;
}

// Event icon mapping
const EVENT_ICONS: Record<string, string> = {
  assessment_completed: "🧠",
  skill_added: "⭐",
  resume_generated: "📄",
  profile_completed: "✅",
  profile_updated: "🔄",
};

interface ProfileViewsTrendChartProps {
  isActive?: boolean; // Will be true when job postings go live
}

export default function ProfileViewsTrendChart({ isActive = false }: ProfileViewsTrendChartProps) {
  if (!isActive) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">روند دیده‌شدن</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              نمودار روند پس از انتشار نیازمندی‌ها فعال می‌شود
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weeklyData = generateWeeklyViewData();
  const maxViews = Math.max(...weeklyData.map((w) => w.views), 1);

  // Calculate trend
  const currentWeekViews = weeklyData[weeklyData.length - 1]?.views || 0;
  const previousWeekViews = weeklyData[weeklyData.length - 2]?.views || 0;
  const hasGrowth = currentWeekViews > previousWeekViews;
  const isFlat = currentWeekViews === previousWeekViews;

  // Trend message
  const getTrendMessage = () => {
    if (hasGrowth) {
      const increase = Math.round(((currentWeekViews - previousWeekViews) / previousWeekViews) * 100);
      return {
        text: `افزایش ${increase}٪ نسبت به هفته گذشته`,
        icon: TrendingUp,
        color: "text-green-700 bg-green-50",
      };
    }
    if (isFlat) {
      return {
        text: "روند ثابت - با به‌روزرسانی پروفایل، دیده‌شدن را بیشتر کنید",
        icon: Minus,
        color: "text-blue-700 bg-blue-50",
      };
    }
    return {
      text: "با تکمیل آزمون‌ها، دیده‌شدن خود را افزایش دهید",
      icon: TrendingUp,
      color: "text-amber-700 bg-amber-50",
    };
  };

  const trendMessage = getTrendMessage();
  const TrendIcon = trendMessage.icon;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">روند دیده‌شدن</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simple Line Chart */}
        <div className="h-40 flex items-end justify-between gap-2 px-2">
          {weeklyData.map((data, index) => {
            const heightPercent = (data.views / maxViews) * 100;
            const isCurrentWeek = index === weeklyData.length - 1;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                {/* Event Annotations */}
                <div className="h-6 flex items-center justify-center gap-0.5">
                  {data.events.slice(0, 3).map((event, eventIndex) => (
                    <span key={eventIndex} className="text-xs" title={event.type}>
                      {EVENT_ICONS[event.type] || "•"}
                    </span>
                  ))}
                </div>

                {/* Bar */}
                <div className="w-full flex flex-col items-center gap-1 flex-1 justify-end">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isCurrentWeek
                        ? "bg-blue-600"
                        : "bg-blue-400"
                    }`}
                    style={{ height: `${heightPercent}%`, minHeight: "8px" }}
                  />

                  {/* View Count */}
                  <div className={`text-xs font-medium ${
                    isCurrentWeek ? "text-blue-900" : "text-gray-600"
                  }`}>
                    {data.views}
                  </div>
                </div>

                {/* Week Label */}
                <div className="text-[10px] text-muted-foreground text-center">
                  {data.week}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trend Message */}
        <div className={`rounded-lg py-2 px-3 ${trendMessage.color}`}>
          <div className="flex items-center gap-2">
            <TrendIcon className="h-3.5 w-3.5 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              {trendMessage.text}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-[10px] text-muted-foreground mb-2">اقدامات ثبت‌شده:</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs">🧠</span>
              <span className="text-[10px] text-muted-foreground">آزمون</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs">⭐</span>
              <span className="text-[10px] text-muted-foreground">مهارت</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs">📄</span>
              <span className="text-[10px] text-muted-foreground">رزومه</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs">✅</span>
              <span className="text-[10px] text-muted-foreground">تکمیل پروفایل</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
