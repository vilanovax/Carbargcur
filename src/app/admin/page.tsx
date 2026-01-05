"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAdminStats } from "@/lib/adminMockData";
import { Users, CheckCircle, Eye, Brain, FileText } from "lucide-react";

export default function AdminDashboard() {
  const stats = mockAdminStats;

  const kpiCards = [
    {
      title: "تعداد کل کاربران",
      value: stats.totalUsers,
      description: "تعداد کل حساب‌های کاربری ثبت‌شده در سیستم",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "پروفایل‌های کامل",
      value: stats.completeProfiles,
      description: "کاربرانی که پروفایل خود را ۱۰۰٪ تکمیل کرده‌اند",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "پروفایل‌های عمومی فعال",
      value: stats.activePublicProfiles,
      description: "پروفایل‌هایی که به صورت عمومی قابل مشاهده هستند",
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "آزمون‌های انجام‌شده",
      value: stats.completedAssessments,
      description: "تعداد کل آزمون‌های تکمیل‌شده توسط کاربران",
      icon: Brain,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "رزومه‌های تولیدشده",
      value: stats.generatedResumes,
      description: "تعداد رزومه‌هایی که کاربران دانلود کرده‌اند",
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
          آمار و وضعیت کلی پلتفرم کاربرگ
        </p>
      </div>

      {/* KPI Cards */}
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
                  {kpi.value.toLocaleString('fa-IR')}
                </div>
                <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Health Info */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">وضعیت سیستم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">نرخ تکمیل پروفایل:</span>
              <span className="font-medium text-gray-900">
                {Math.round((stats.completeProfiles / stats.totalUsers) * 100)}٪
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">نرخ فعال‌سازی پروفایل عمومی:</span>
              <span className="font-medium text-gray-900">
                {Math.round((stats.activePublicProfiles / stats.completeProfiles) * 100)}٪
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">نرخ تولید رزومه:</span>
              <span className="font-medium text-gray-900">
                {Math.round((stats.generatedResumes / stats.completeProfiles) * 100)}٪
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
