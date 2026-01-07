"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Eye, Brain, FileText, Briefcase, FileCheck, ClipboardList } from "lucide-react";
import InsightBox from "@/components/admin/InsightBox";
import FunnelOverview from "@/components/admin/FunnelOverview";
import AlertsPanel from "@/components/admin/AlertsPanel";
import TrendsSummary from "@/components/admin/TrendsSummary";
import QuickActions from "@/components/admin/QuickActions";

interface AdminStats {
  // User stats
  totalUsers: number;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  // Profile stats
  profileStarted: number;
  completeProfiles: number;
  activePublicProfiles: number;
  generatedResumes: number;
  completedProfilesThisWeek: number;
  completedProfilesLastWeek: number;
  resumesThisWeek: number;
  resumesLastWeek: number;
  // Job stats
  totalJobs: number;
  activeJobs: number;
  featuredJobs: number;
  newJobsThisWeek: number;
  // Application stats
  totalApplications: number;
  pendingApplications: number;
  reviewedApplications: number;
  shortlistedApplications: number;
  applicationsThisWeek: number;
  // Assessment stats
  totalAssessments: number;
  discAssessments: number;
  hollandAssessments: number;
  assessmentsThisWeek: number;
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
    completedAssessments: stats.totalAssessments,
    totalJobs: stats.totalJobs,
    activeJobs: stats.activeJobs,
    totalApplications: stats.totalApplications,
    pendingApplications: stats.pendingApplications,
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
    completedAssessmentsLast7Days: stats.assessmentsThisWeek,
    generatedResumesLast7Days: stats.resumesThisWeek,
    generatedResumesLastWeek: stats.resumesThisWeek,
    generatedResumesPrevWeek: stats.resumesLastWeek,
    pendingApplications: stats.pendingApplications,
    applicationsThisWeek: stats.applicationsThisWeek,
  };

  const trendMetrics = {
    newUsersThisWeek: stats.newUsersThisWeek,
    newUsersLastWeek: stats.newUsersLastWeek,
    completedProfilesThisWeek: stats.completedProfilesThisWeek,
    completedProfilesLastWeek: stats.completedProfilesLastWeek,
    resumesThisWeek: stats.resumesThisWeek,
    resumesLastWeek: stats.resumesLastWeek,
  };

  const safePercent = (a: number, b: number) => b > 0 ? Math.round((a / b) * 100) : 0;

  const kpiCards = [
    {
      title: "تعداد کل کاربران",
      value: stats.totalUsers,
      description: `${safePercent(stats.completeProfiles, stats.totalUsers)}٪ پروفایل کامل دارند`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "پروفایل‌های کامل",
      value: stats.completeProfiles,
      description: `${safePercent(stats.completeProfiles, stats.profileStarted)}٪ از کاربرانی که شروع کرده‌اند`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "پروفایل‌های عمومی فعال",
      value: stats.activePublicProfiles,
      description: `${safePercent(stats.activePublicProfiles, stats.completeProfiles)}٪ از پروفایل‌های کامل`,
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "شغل‌های فعال",
      value: stats.activeJobs,
      description: `${stats.totalJobs} شغل کل · ${stats.featuredJobs} ویژه`,
      icon: Briefcase,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "درخواست‌های شغلی",
      value: stats.totalApplications,
      description: `${stats.pendingApplications} در انتظار بررسی · ${stats.shortlistedApplications} گزینش‌شده`,
      icon: ClipboardList,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "آزمون‌های انجام‌شده",
      value: stats.totalAssessments,
      description: `${stats.discAssessments} DISC · ${stats.hollandAssessments} Holland`,
      icon: Brain,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "رزومه‌های تولیدشده",
      value: stats.generatedResumes,
      description: `${safePercent(stats.generatedResumes, stats.completeProfiles)}٪ از پروفایل‌های کامل`,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <h4 className="font-medium text-gray-700">پروفایل‌ها</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">نرخ تکمیل پروفایل:</span>
                <span className="font-medium text-gray-900">
                  {safePercent(stats.completeProfiles, stats.totalUsers)}٪
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">نرخ فعال‌سازی عمومی:</span>
                <span className="font-medium text-gray-900">
                  {safePercent(stats.activePublicProfiles, stats.completeProfiles)}٪
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">نرخ تولید رزومه:</span>
                <span className="font-medium text-gray-900">
                  {safePercent(stats.generatedResumes, stats.completeProfiles)}٪
                </span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <h4 className="font-medium text-gray-700">شغل‌ها و درخواست‌ها</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">نرخ شغل‌های فعال:</span>
                <span className="font-medium text-gray-900">
                  {safePercent(stats.activeJobs, stats.totalJobs)}٪
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">درخواست در انتظار بررسی:</span>
                <span className="font-medium text-gray-900">
                  {stats.pendingApplications.toLocaleString("fa-IR")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">درخواست‌های این هفته:</span>
                <span className="font-medium text-gray-900">
                  {stats.applicationsThisWeek.toLocaleString("fa-IR")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
