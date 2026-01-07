"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface AlertMetrics {
  totalUsers: number;
  profileStarted: number;
  completeProfiles: number;
  completedAssessmentsLast7Days: number;
  generatedResumesLast7Days: number;
  generatedResumesLastWeek: number;
  generatedResumesPrevWeek: number;
}

interface Alert {
  severity: "warning" | "info";
  title: string;
  description: string;
  suggestedAction: string;
  actionHref?: string;
}

interface AlertsPanelProps {
  metrics: AlertMetrics;
}

export default function AlertsPanel({ metrics }: AlertsPanelProps) {
  const alerts = generateAlerts(metrics);

  if (alerts.length === 0) {
    return null; // Don't render if no alerts
  }

  // Show max 3 alerts
  const topAlerts = alerts.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          نیازمند توجه
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topAlerts.map((alert, index) => {
          const isWarning = alert.severity === "warning";
          const Icon = isWarning ? AlertTriangle : Info;

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isWarning
                  ? "bg-orange-50 border-orange-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isWarning ? "text-orange-600" : "text-blue-600"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {alert.title}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      پیشنهاد:
                    </span>
                    <span className="text-xs text-gray-700">
                      {alert.suggestedAction}
                    </span>
                    {alert.actionHref && (
                      <Link href={alert.actionHref} className="mr-auto">
                        <Button
                          size="sm"
                          variant="link"
                          className="h-auto p-0 text-xs"
                        >
                          مشاهده <ArrowLeft className="w-3 h-3 mr-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Rule-based alert generation
function generateAlerts(metrics: AlertMetrics): Alert[] {
  const alerts: Alert[] = [];

  // Calculate metrics
  const incompleteProfiles = metrics.profileStarted - metrics.completeProfiles;
  const incompleteProfilesPercentage =
    metrics.profileStarted > 0
      ? (incompleteProfiles / metrics.profileStarted) * 100
      : 0;

  const resumeDropPercentage =
    metrics.generatedResumesLastWeek > 0
      ? ((metrics.generatedResumesLastWeek - metrics.generatedResumesPrevWeek) /
          metrics.generatedResumesLastWeek) *
        100
      : 0;

  // Alert 1: High number of incomplete profiles
  if (incompleteProfiles > 20 && incompleteProfilesPercentage > 30) {
    alerts.push({
      severity: "warning",
      title: "تعداد بالای پروفایل‌های ناقص",
      description: `${incompleteProfiles.toLocaleString("fa-IR")} کاربر پروفایل خود را شروع کرده‌اند اما تکمیل نکرده‌اند (${incompleteProfilesPercentage.toFixed(0)}٪).`,
      suggestedAction: "بررسی فرم‌های مهارت‌ها و مراحل پرکردن پروفایل",
      actionHref: "/admin/users",
    });
  }

  // Alert 2: Very low test completion in last 7 days
  if (
    metrics.completedAssessmentsLast7Days < 5 &&
    metrics.completeProfiles > 20
  ) {
    alerts.push({
      severity: "info",
      title: "فعالیت پایین آزمون‌ها",
      description: `تنها ${metrics.completedAssessmentsLast7Days.toLocaleString("fa-IR")} آزمون در ۷ روز گذشته تکمیل شده است.`,
      suggestedAction:
        "افزایش یادآوری‌ها یا نمایش بهتر آزمون‌ها در داشبورد کاربر",
      actionHref: "/admin/assessments",
    });
  }

  // Alert 3: Resume generation dropped week-over-week
  if (
    resumeDropPercentage < -15 &&
    metrics.generatedResumesLastWeek > 5 &&
    metrics.generatedResumesPrevWeek > 5
  ) {
    alerts.push({
      severity: "warning",
      title: "کاهش تولید رزومه",
      description: `تولید رزومه نسبت به هفته قبل ${Math.abs(resumeDropPercentage).toFixed(0)}٪ کاهش یافته است.`,
      suggestedAction:
        "بررسی مشکلات فنی یا کیفیت رزومه‌های تولیدشده در هفته اخیر",
    });
  }

  // Alert 4: Low activation rate (if activated profiles < 50% of complete)
  if (metrics.completeProfiles > 10) {
    const activationRate = 0; // This would need activePublicProfiles metric
    // Placeholder for now - this alert can be added when metric is available
  }

  return alerts;
}
