"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Eye, FileText } from "lucide-react";

export interface FunnelMetrics {
  totalUsers: number;
  profileStarted: number;
  completeProfiles: number;
  activePublicProfiles: number;
  generatedResumes: number;
}

interface FunnelOverviewProps {
  metrics: FunnelMetrics;
}

export default function FunnelOverview({ metrics }: FunnelOverviewProps) {
  // Calculate percentages relative to previous stage
  const stages = [
    {
      label: "ثبت‌نام کاربر",
      count: metrics.totalUsers,
      percentage: 100,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "پروفایل شروع‌شده",
      count: metrics.profileStarted,
      percentage:
        metrics.totalUsers > 0
          ? (metrics.profileStarted / metrics.totalUsers) * 100
          : 0,
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      label: "پروفایل تکمیل‌شده",
      count: metrics.completeProfiles,
      percentage:
        metrics.profileStarted > 0
          ? (metrics.completeProfiles / metrics.profileStarted) * 100
          : 0,
      icon: UserCheck,
      color: "bg-purple-500",
    },
    {
      label: "پروفایل عمومی",
      count: metrics.activePublicProfiles,
      percentage:
        metrics.completeProfiles > 0
          ? (metrics.activePublicProfiles / metrics.completeProfiles) * 100
          : 0,
      icon: Eye,
      color: "bg-indigo-500",
    },
    {
      label: "رزومه ساخته‌شده",
      count: metrics.generatedResumes,
      percentage:
        metrics.completeProfiles > 0
          ? (metrics.generatedResumes / metrics.completeProfiles) * 100
          : 0,
      icon: FileText,
      color: "bg-teal-500",
    },
  ];

  // Find biggest drop-off
  let biggestDropStage = "";
  let biggestDrop = 0;

  for (let i = 1; i < stages.length; i++) {
    const dropPercentage = 100 - stages[i].percentage;
    if (dropPercentage > biggestDrop) {
      biggestDrop = dropPercentage;
      biggestDropStage = stages[i].label;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">وضعیت قیف کاربران</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isLowConversion = index > 0 && stage.percentage < 60;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {stage.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 font-semibold">
                    {stage.count.toLocaleString("fa-IR")}
                  </span>
                  {index > 0 && (
                    <span
                      className={`text-xs font-medium ${
                        isLowConversion ? "text-orange-600" : "text-gray-600"
                      }`}
                    >
                      {stage.percentage.toFixed(0)}٪
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} ${
                    isLowConversion ? "opacity-60" : ""
                  } transition-all`}
                  style={{
                    width: index === 0 ? "100%" : `${stage.percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Drop-off insight */}
        {biggestDrop > 30 && (
          <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>توجه:</strong> بیشترین ریزش در مرحله{" "}
              <strong>«{biggestDropStage}»</strong> مشاهده می‌شود (
              {biggestDrop.toFixed(0)}٪ ریزش)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
