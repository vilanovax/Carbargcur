"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  mockAdminAssessments,
  getAssessmentCategoryLabel,
  getAssessmentStatusLabel,
  type AdminAssessment,
} from "@/lib/adminMockData";
import { Power, PowerOff, Users, TrendingUp } from "lucide-react";

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<AdminAssessment[]>(
    mockAdminAssessments
  );

  const handleToggleStatus = (assessmentId: string) => {
    const assessment = assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;

    if (assessment.status === "coming_soon") {
      alert("آزمون‌های «به‌زودی» نیاز به پیاده‌سازی کامل دارند");
      return;
    }

    const newStatus = assessment.status === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "فعال‌سازی" : "غیرفعال‌سازی";

    const confirm = window.confirm(
      `آیا از ${action} آزمون «${assessment.title}» مطمئن هستید؟`
    );

    if (confirm) {
      setAssessments(
        assessments.map((a) =>
          a.id === assessmentId ? { ...a, status: newStatus } : a
        )
      );
      // TODO: Call API to update assessment status
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "personality":
        return "bg-purple-100 text-purple-700";
      case "soft_skill":
        return "bg-blue-100 text-blue-700";
      case "technical":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "coming_soon":
        return "secondary";
      case "inactive":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">مدیریت آزمون‌ها</h2>
        <p className="text-sm text-gray-600 mt-1">
          مدیریت آزمون‌ها و مشاهده آمار شرکت‌کنندگان
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {assessments.length.toLocaleString('fa-IR')}
            </div>
            <p className="text-sm text-gray-600">کل آزمون‌ها</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {assessments.filter((a) => a.status === "active").length.toLocaleString('fa-IR')}
            </div>
            <p className="text-sm text-gray-600">آزمون‌های فعال</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {assessments
                .reduce((sum, a) => sum + a.participantCount, 0)
                .toLocaleString('fa-IR')}
            </div>
            <p className="text-sm text-gray-600">کل شرکت‌کنندگان</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                assessments.reduce((sum, a) => sum + a.completionRate, 0) /
                  assessments.filter((a) => a.status === "active").length
              )}٪
            </div>
            <p className="text-sm text-gray-600">میانگین تکمیل</p>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Assessment Info */}
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {assessment.title}
                      </h3>
                      <Badge
                        variant={getStatusColor(assessment.status)}
                        className="text-xs"
                      >
                        {getAssessmentStatusLabel(assessment.status)}
                      </Badge>
                    </div>
                    <Badge
                      className={`text-xs ${getCategoryColor(assessment.category)}`}
                    >
                      {getAssessmentCategoryLabel(assessment.category)}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">
                          شرکت‌کنندگان
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {assessment.participantCount.toLocaleString('fa-IR')} نفر
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">
                          نرخ تکمیل
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {assessment.completionRate.toLocaleString('fa-IR')}٪
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {assessment.status !== "coming_soon" && (
                    <Button
                      size="sm"
                      variant={assessment.status === "active" ? "destructive" : "default"}
                      onClick={() => handleToggleStatus(assessment.id)}
                    >
                      {assessment.status === "active" ? (
                        <>
                          <PowerOff className="w-4 h-4 ml-2" />
                          غیرفعال‌سازی
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 ml-2" />
                          فعال‌سازی
                        </>
                      )}
                    </Button>
                  )}
                  {assessment.status === "coming_soon" && (
                    <div className="text-xs text-gray-500 text-center p-2">
                      نیاز به پیاده‌سازی کامل
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {assessment.status === "active" && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>میزان تکمیل آزمون</span>
                    <span className="font-medium">{assessment.completionRate}٪</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        assessment.completionRate >= 80
                          ? 'bg-green-500'
                          : assessment.completionRate >= 50
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${assessment.completionRate}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>توجه:</strong> در این نسخه MVP، تنها امکان فعال/غیرفعال کردن آزمون‌ها وجود دارد.
            برای ویرایش سوالات، گزینه‌ها یا نتایج آزمون‌ها به نسخه‌های بعدی مراجعه کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
