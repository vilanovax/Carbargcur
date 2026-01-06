"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import type { FocusedProfile } from "@/lib/onboarding";

interface ZeroStateDashboardProps {
  profile: FocusedProfile | null;
}

/**
 * Zero-State Dashboard Mode
 *
 * Shown when user has NO meaningful profile data.
 * Purpose: Guided onboarding experience, NOT reporting.
 *
 * Philosophy:
 * - No metrics, no percentages, no "غیرفعال" labels
 * - Clear value proposition
 * - ONE primary action
 * - Professional, calm, motivating tone
 */
export default function ZeroStateDashboard({
  profile,
}: ZeroStateDashboardProps) {
  const firstName = profile?.fullName?.split(" ")[0] || "کاربر";

  return (
    <div className="space-y-6">
      {/* 1️⃣ Header (Warm, Non-Technical) */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">خوش آمدید، {firstName}</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          کاربرگ به شما کمک می‌کند
          <br />
          سریع‌تر توسط کارفرماهای حوزه مالی دیده شوید
        </p>
      </div>

      {/* 2️⃣ Hero Card — Invitation (NOT score) */}
      <Card className="shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                پروفایل حرفه‌ای شما هنوز ساخته نشده
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                با ساخت پروفایل:
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>رزومه حرفه‌ای دریافت می‌کنید</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>در جستجوی کارفرماها نمایش داده می‌شوید</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>مهارت‌ها و سبک کاری شما مشخص می‌شود</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/app/profile/onboarding/step-1-basic">
                  شروع ساخت پروفایل حرفه‌ای
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                ⏱ زمان تقریبی: ۵ دقیقه
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3️⃣ Promise / Value Card (Trust Builder) */}
      <Card className="shadow-md border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 text-center">
            در کاربرگ چه چیزی به دست می‌آورید؟
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm">پروفایل تخصصی برای صنعت مالی</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm">رزومه آماده ارسال</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm">تطبیق هوشمند با نیازمندی‌ها</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm">نمایش مهارت‌ها و سبک کاری</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4️⃣ First Step Card (Next Action – Simplified) */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                اولین قدم برای دیده‌شدن
              </p>
              <h3 className="text-lg font-bold mb-2">
                تکمیل اطلاعات پایه
              </h3>
              <p className="text-sm text-muted-foreground">
                نام، شهر و تمرکز شغلی شما برای فعال‌شدن پروفایل کافی است.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/app/profile/onboarding/step-1-basic">
                شروع (کمتر از ۲ دقیقه) →
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 6️⃣ Footer Trust Note (Mandatory) */}
      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <p className="text-xs text-center text-blue-800 leading-relaxed">
            اطلاعات شما محرمانه است و فقط با اجازه شما برای کارفرماها نمایش
            داده می‌شود.
          </p>
          <p className="text-center mt-2">
            <Link
              href="/privacy"
              className="text-xs text-blue-600 hover:underline"
            >
              چگونه اطلاعات شما استفاده می‌شود؟
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
