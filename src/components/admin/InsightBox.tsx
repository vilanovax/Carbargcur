"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingDown, AlertTriangle, Target } from "lucide-react";
import Link from "next/link";

export interface DashboardMetrics {
  totalUsers: number;
  profileStarted: number;
  completeProfiles: number;
  activePublicProfiles: number;
  generatedResumes: number;
  completedAssessments: number;
}

interface Insight {
  type: "warning" | "info";
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

interface InsightBoxProps {
  metrics: DashboardMetrics;
}

export default function InsightBox({ metrics }: InsightBoxProps) {
  const insights = generateInsights(metrics);

  if (insights.length === 0) {
    return null; // Don't show if no insights
  }

  // Show top 2 insights
  const topInsights = insights.slice(0, 2);

  return (
    <div className="space-y-3">
      {topInsights.map((insight, index) => {
        const Icon = insight.icon;
        const isWarning = insight.type === "warning";

        return (
          <Card
            key={index}
            className={`border-r-4 ${
              isWarning
                ? "border-r-orange-500 bg-orange-50/50"
                : "border-r-blue-500 bg-blue-50/50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    isWarning ? "bg-orange-100" : "bg-blue-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isWarning ? "text-orange-700" : "text-blue-700"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {insight.title}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                    {insight.actionHref && insight.actionLabel && (
                      <Link href={insight.actionHref}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0 text-xs"
                        >
                          {insight.actionLabel}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Rule-based insight generation
function generateInsights(metrics: DashboardMetrics): Insight[] {
  const insights: Insight[] = [];

  // Calculate key ratios
  const profileCompletionRate =
    metrics.totalUsers > 0
      ? (metrics.completeProfiles / metrics.totalUsers) * 100
      : 0;

  const profileDropOffRate =
    metrics.profileStarted > 0
      ? ((metrics.profileStarted - metrics.completeProfiles) /
          metrics.profileStarted) *
        100
      : 0;

  const publicActivationRate =
    metrics.completeProfiles > 0
      ? (metrics.activePublicProfiles / metrics.completeProfiles) * 100
      : 0;

  const testVsResumeRatio =
    metrics.generatedResumes > 0
      ? (metrics.completedAssessments / metrics.generatedResumes) * 100
      : 0;

  // Rule 1: High profile drop-off (>30%)
  if (profileDropOffRate > 30) {
    insights.push({
      type: "warning",
      icon: TrendingDown,
      title: "ریزش بالا در تکمیل پروفایل",
      description: `${profileDropOffRate.toFixed(0)}٪ از کاربرانی که پروفایل را شروع کرده‌اند، آن را تکمیل نکرده‌اند. بررسی مراحل فرم برای شناسایی موانع توصیه می‌شود.`,
      actionLabel: "بررسی کاربران ناقص",
      actionHref: "/admin/users",
    });
  }

  // Rule 2: Low test adoption (<50% of resume generators)
  if (testVsResumeRatio < 50 && metrics.generatedResumes > 10) {
    insights.push({
      type: "info",
      icon: Brain,
      title: "نرخ پایین استفاده از آزمون‌ها",
      description: `تنها ${testVsResumeRatio.toFixed(0)}٪ از کاربرانی که رزومه ساخته‌اند، آزمون شخصیت‌شناسی را تکمیل کرده‌اند. افزایش تبلیغ آزمون‌ها می‌تواند مفید باشد.`,
      actionLabel: "مدیریت آزمون‌ها",
      actionHref: "/admin/assessments",
    });
  }

  // Rule 3: Low public profile activation (<60%)
  if (publicActivationRate < 60 && metrics.completeProfiles > 10) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: "نرخ پایین فعال‌سازی پروفایل عمومی",
      description: `${publicActivationRate.toFixed(0)}٪ از پروفایل‌های کامل، به صورت عمومی فعال شده‌اند. کاربران ممکن است نیاز به توضیح بیشتر درباره مزایای نمایش عمومی داشته باشند.`,
      actionLabel: "مشاهده پروفایل‌ها",
      actionHref: "/admin/profiles",
    });
  }

  // Rule 4: Good completion rate (>70%)
  if (profileCompletionRate > 70) {
    insights.push({
      type: "info",
      icon: Target,
      title: "نرخ تکمیل خوب",
      description: `${profileCompletionRate.toFixed(0)}٪ از کاربران پروفایل خود را کامل کرده‌اند. این عملکرد خوبی است و نشان‌دهنده تجربه کاربری مناسب می‌باشد.`,
    });
  }

  return insights;
}
