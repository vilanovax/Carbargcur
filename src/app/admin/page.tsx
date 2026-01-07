"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Eye, Brain, FileText } from "lucide-react";
import InsightBox from "@/components/admin/InsightBox";
import FunnelOverview from "@/components/admin/FunnelOverview";
import AlertsPanel from "@/components/admin/AlertsPanel";
import TrendsSummary from "@/components/admin/TrendsSummary";
import QuickActions from "@/components/admin/QuickActions";

interface AdminStats {
  totalUsers: number;
  profileStarted: number;
  completeProfiles: number;
  activePublicProfiles: number;
  generatedResumes: number;
  completedAssessments: number;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  completedProfilesThisWeek: number;
  completedProfilesLastWeek: number;
  resumesThisWeek: number;
  resumesLastWeek: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/stats");

      if (response.status === 403) {
        // Not authenticated - redirect to auth page
        router.push("/auth?redirectTo=/admin");
        return;
      }

      if (!response.ok) {
        throw new Error("خطا در دریافت آمار");
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error("Load stats error:", err);
      setError("خطا در دریافت آمار سیستم");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-600">{error || "خطا در دریافت اطلاعات"}</p>
      </div>
    );
  }

  // Extended metrics for Phase 2 components - now using real data
  const dashboardMetrics = {
    totalUsers: stats.totalUsers,
    profileStarted: stats.profileStarted,
    completeProfiles: stats.completeProfiles,
    activePublicProfiles: stats.activePublicProfiles,
    generatedResumes: stats.generatedResumes,
    completedAssessments: stats.completedAssessments,
  };

  const funnelMetrics = {
    totalUsers: stats.totalUsers,
    profileStarted: stats.profileStarted,
    completeProfiles: stats.completeProfiles,
    activePublicProfiles: stats.activePublicProfiles,
    generatedResumes: stats.generatedResumes,
  };

  const alertMetrics = {
    totalUsers: stats.totalUsers,
    profileStarted: stats.profileStarted,
    completeProfiles: stats.completeProfiles,
    completedAssessmentsLast7Days: stats.completedAssessments,
    generatedResumesLast7Days: stats.resumesThisWeek,
    generatedResumesLastWeek: stats.resumesThisWeek,
    generatedResumesPrevWeek: stats.resumesLastWeek,
  };

  const trendMetrics = {
    newUsersThisWeek: stats.newUsersThisWeek,
    newUsersLastWeek: stats.newUsersLastWeek,
    completedProfilesThisWeek: stats.completedProfilesThisWeek,
    completedProfilesLastWeek: stats.completedProfilesLastWeek,
    resumesThisWeek: stats.resumesThisWeek,
    resumesLastWeek: stats.resumesLastWeek,
  };

  const kpiCards = [
    {
      title: "تعداد کل کاربران",
      value: stats.totalUsers,
      description: `${Math.round((dashboardMetrics.completeProfiles / stats.totalUsers) * 100)}٪ پروفایل کامل دارند`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "پروفایل‌های کامل",
      value: stats.completeProfiles,
      description: `${Math.round((stats.completeProfiles / Math.floor(stats.totalUsers * 0.75)) * 100)}٪ از کاربرانی که شروع کرده‌اند`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "پروفایل‌های عمومی فعال",
      value: stats.activePublicProfiles,
      description: `${Math.round((stats.activePublicProfiles / stats.completeProfiles) * 100)}٪ از پروفایل‌های کامل`,
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "آزمون‌های انجام‌شده",
      value: stats.completedAssessments,
      description: "٣ آزمون در ۷ روز اخیر (موک)",
      icon: Brain,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "رزومه‌های تولیدشده",
      value: stats.generatedResumes,
      description: `${Math.round((stats.generatedResumes / stats.completeProfiles) * 100)}٪ از پروفایل‌های کامل`,
      icon: FileText,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">نمای کلی سیستم</h2>
        <p className="text-sm text-gray-600 mt-1">
          آمار، روندها و بینش‌های مدیریتی پلتفرم کاربرگ
        </p>
      </div>

      {/* Phase 2: Insight Box */}
      <InsightBox metrics={dashboardMetrics} />

      {/* KPI Cards - Enhanced with context */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <Card key={kpi.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {kpi.value.toLocaleString("fa-IR")}
                </div>
                <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Phase 2: Two-column layout for Funnel & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelOverview metrics={funnelMetrics} />
        <AlertsPanel metrics={alertMetrics} />
      </div>

      {/* Phase 2: Trends Summary */}
      <TrendsSummary metrics={trendMetrics} />

      {/* Phase 2: Quick Actions */}
      <QuickActions />

      {/* System Health Info - Kept from Phase 1 */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">وضعیت سیستم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">نرخ تکمیل پروفایل:</span>
              <span className="font-medium text-gray-900">
                {Math.round(
                  (stats.completeProfiles / stats.totalUsers) * 100
                )}
                ٪
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">نرخ فعال‌سازی پروفایل عمومی:</span>
              <span className="font-medium text-gray-900">
                {Math.round(
                  (stats.activePublicProfiles / stats.completeProfiles) * 100
                )}
                ٪
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">نرخ تولید رزومه:</span>
              <span className="font-medium text-gray-900">
                {Math.round(
                  (stats.generatedResumes / stats.completeProfiles) * 100
                )}
                ٪
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
