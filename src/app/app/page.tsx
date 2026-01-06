"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import {
  type FocusedProfile,
  loadFocusedFromStorage,
} from "@/lib/onboarding";
import { calculateProfileStrength } from "@/lib/profileStrength";
import ProfileStrengthWidget from "@/components/dashboard/ProfileStrengthWidget";
import ProfileViewsWidget from "@/components/dashboard/ProfileViewsWidget";
import ProfileReadinessWidget from "@/components/dashboard/ProfileReadinessWidget";
import ProfileViewsTrendChart from "@/components/dashboard/ProfileViewsTrendChart";
import FullResultVisualization from "@/components/assessment/FullResultVisualization";

export default function DashboardPage() {
  const [profile, setProfile] = useState<FocusedProfile | null>(null);

  useEffect(() => {
    const data = loadFocusedFromStorage();
    setProfile(data);
  }, []);

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">در حال بارگذاری...</div>
      </div>
    );
  }

  const strength = calculateProfileStrength(profile);
  const isProfileComplete = strength.percentage >= 60; // Required steps complete

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">
          {isProfileComplete
            ? "پروفایل حرفه‌ای شما آماده استفاده است"
            : `خوش آمدید، ${profile.fullName || "کاربر"}`}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {isProfileComplete
            ? "این داشبورد وضعیت دیده‌شدن و قدرت پروفایل شما را نشان می‌دهد"
            : "با تکمیل پروفایل، شانس یافتن فرصت مناسب را افزایش دهید"}
        </p>
      </div>

      {/* 3 Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <ProfileStrengthWidget profile={profile} />
        <ProfileViewsWidget isActive={false} />
        <ProfileReadinessWidget profile={profile} />
      </div>

      {/* Weekly Profile Views Trend Chart */}
      <ProfileViewsTrendChart isActive={false} />

      {/* Full Assessment Results Visualization */}
      {profile.personality?.full && (
        <FullResultVisualization result={profile.personality.full} />
      )}

      {/* Profile Strengthening Section (when complete) or Completion Checklist (when incomplete) */}
      {isProfileComplete ? (
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-bold">راه‌های تقویت پروفایل</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                پروفایل شما کامل است، اما با انجام این موارد می‌توانید آن را قوی‌تر کنید:
              </p>

              <div className="space-y-2 md:space-y-3">
                {/* MBTI Assessment */}
                <Link href="/app/assessments/mbti" className="block">
                  <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-xs md:text-sm">آزمون سبک کاری (MBTI)</h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                        + سیگنال رفتاری برای کارفرمایان
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>

                {/* DISC Assessment */}
                <Link href="/app/assessments/disc" className="block">
                  <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-xs md:text-sm">آزمون رفتار حرفه‌ای (DISC)</h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                        + دقت در Matching با نیازمندی‌ها
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>

                {/* Update Skills */}
                <Link href="/app/profile/onboarding/step-2-status" className="block">
                  <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-xs md:text-sm">به‌روزرسانی مهارت‌ها</h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                        اضافه کردن مهارت جدید یا تغییر مهارت‌های کلیدی
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50/30 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-bold text-amber-900">تکمیل پروفایل</h2>
              <p className="text-xs md:text-sm text-amber-800">
                برای استفاده کامل از کاربرگ، این بخش‌ها را تکمیل کنید:
              </p>

              <div className="space-y-2">
                {strength.missingSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs md:text-sm text-amber-900"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-xs md:text-sm">
                <Link href="/app/profile/onboarding">تکمیل پروفایل</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-2 md:space-y-3">
              <h3 className="font-semibold text-sm md:text-base">رزومه حرفه‌ای</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                رزومه شما به‌طور خودکار از پروفایل ساخته می‌شود
              </p>
              <Button asChild variant="outline" className="w-full text-xs md:text-sm">
                <Link href="/app/resume">مشاهده و دانلود رزومه</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-2 md:space-y-3">
              <h3 className="font-semibold text-sm md:text-base">پروفایل عمومی</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                مشاهده پروفایل حرفه‌ای که کارفرمایان می‌بینند
              </p>
              <Button asChild variant="outline" className="w-full text-xs md:text-sm">
                <Link href="/app/profile">مشاهده پروفایل</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Message */}
      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-center text-blue-800 leading-relaxed">
            اطلاعات شما محرمانه است و تنها زمانی که شما اجازه دهید برای کارفرمایان نمایش داده می‌شود
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
