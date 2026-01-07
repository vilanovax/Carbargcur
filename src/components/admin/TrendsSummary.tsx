"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface TrendsMetrics {
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  completedProfilesThisWeek: number;
  completedProfilesLastWeek: number;
  resumesThisWeek: number;
  resumesLastWeek: number;
}

interface TrendsSummaryProps {
  metrics: TrendsMetrics;
}

export default function TrendsSummary({ metrics }: TrendsSummaryProps) {
  const trends = [
    {
      label: "کاربران جدید",
      thisWeek: metrics.newUsersThisWeek,
      lastWeek: metrics.newUsersLastWeek,
    },
    {
      label: "پروفایل‌های کامل‌شده",
      thisWeek: metrics.completedProfilesThisWeek,
      lastWeek: metrics.completedProfilesLastWeek,
    },
    {
      label: "رزومه‌های تولیدشده",
      thisWeek: metrics.resumesThisWeek,
      lastWeek: metrics.resumesLastWeek,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">مقایسه هفته جاری با هفته قبل</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend, index) => {
            const change = trend.thisWeek - trend.lastWeek;
            const percentageChange =
              trend.lastWeek > 0
                ? ((change / trend.lastWeek) * 100).toFixed(0)
                : trend.thisWeek > 0
                ? 100
                : 0;

            const isPositive = change > 0;
            const isNegative = change < 0;
            const isNeutral = change === 0;

            const TrendIcon = isPositive
              ? TrendingUp
              : isNegative
              ? TrendingDown
              : Minus;
            const trendColor = isPositive
              ? "text-green-600"
              : isNegative
              ? "text-red-600"
              : "text-gray-500";
            const bgColor = isPositive
              ? "bg-green-50"
              : isNegative
              ? "bg-red-50"
              : "bg-gray-50";

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {trend.label}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-bold text-gray-900">
                      {trend.thisWeek.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-xs text-gray-500">
                      (هفته قبل: {trend.lastWeek.toLocaleString("fa-IR")})
                    </span>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${bgColor}`}
                >
                  <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                  <span className={`text-sm font-semibold ${trendColor}`}>
                    {isNeutral
                      ? "—"
                      : `${isPositive ? "+" : ""}${percentageChange}٪`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          داده‌های بر اساس ۷ روز اخیر نسبت به ۷ روز قبل از آن
        </p>
      </CardContent>
    </Card>
  );
}
