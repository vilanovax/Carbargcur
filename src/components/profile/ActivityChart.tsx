"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityData {
  week: string;
  answers: number;
  questions: number;
}

interface ActivityChartProps {
  userId: string;
}

export default function ActivityChart({ userId }: ActivityChartProps) {
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, [userId]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/activity`);
      if (response.ok) {
        const data = await response.json();
        setActivity(data.activity || []);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...activity.map(a => a.answers + a.questions),
    1
  );

  // Check if there's any activity
  const hasActivity = activity.some(a => a.answers > 0 || a.questions > 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !hasActivity) {
    return null; // Don't show if no activity or error
  }

  // Get intensity level (0-4) based on value
  const getIntensity = (value: number): number => {
    if (value === 0) return 0;
    const ratio = value / maxValue;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const intensityColors = [
    "bg-muted",
    "bg-green-200 dark:bg-green-900",
    "bg-green-300 dark:bg-green-700",
    "bg-green-500 dark:bg-green-500",
    "bg-green-600 dark:bg-green-400",
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4" />
          فعالیت ۱۲ هفته اخیر
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Activity Grid */}
          <div className="flex items-end gap-1 justify-between">
            {activity.map((week, index) => {
              const total = week.answers + week.questions;
              const intensity = getIntensity(total);

              return (
                <div key={week.week} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-5 h-5 md:w-6 md:h-6 rounded-sm transition-colors",
                      intensityColors[intensity]
                    )}
                    title={`${total} فعالیت (${week.answers} پاسخ، ${week.questions} سؤال)`}
                  />
                  {index === 0 && (
                    <span className="text-[10px] text-muted-foreground">۱۲ هفته پیش</span>
                  )}
                  {index === activity.length - 1 && (
                    <span className="text-[10px] text-muted-foreground">این هفته</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground pt-2">
            <span>کمتر</span>
            <div className="flex gap-0.5">
              {intensityColors.map((color, i) => (
                <div
                  key={i}
                  className={cn("w-3 h-3 rounded-sm", color)}
                />
              ))}
            </div>
            <span>بیشتر</span>
          </div>

          {/* Stats Summary */}
          <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t">
            <span className="text-muted-foreground">
              مجموع:{" "}
              <span className="font-medium text-foreground">
                {activity.reduce((sum, w) => sum + w.answers + w.questions, 0)} فعالیت
              </span>
            </span>
            <span className="text-muted-foreground">
              ({activity.reduce((sum, w) => sum + w.answers, 0)} پاسخ،{" "}
              {activity.reduce((sum, w) => sum + w.questions, 0)} سؤال)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
