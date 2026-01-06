"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Target, Brain } from "lucide-react";
import {
  type FocusedProfile,
  loadFocusedFromStorage,
} from "@/lib/onboarding";
import { calculateProfileStrength } from "@/lib/profileStrength";

// Next Best Action Engine
function getNextBestAction(profile: FocusedProfile | null) {
  if (!profile) {
    return {
      title: "شروع ساخت پروفایل",
      description: "برای استفاده از کاربرگ، ابتدا باید پروفایل خود را بسازید.",
      ctaLabel: "شروع کنید",
      href: "/app/profile/onboarding/step-1-basic",
    };
  }

  // 1. No basic info
  if (!profile.fullName || !profile.recentExperience?.role) {
    return {
      title: "تکمیل اطلاعات پایه",
      description: "نام و سابقه کاری اخیر شما نیاز است تا پروفایل فعال شود.",
      ctaLabel: "تکمیل اطلاعات پایه",
      href: "/app/profile/onboarding/step-1-basic",
    };
  }

  // 2. No profile photo
  if (!profile.photoUrl) {
    return {
      title: "افزودن عکس پروفایل",
      description: "پروفایل‌های با عکس تا ۳ برابر بیشتر دیده می‌شوند.",
      ctaLabel: "آپلود عکس",
      href: "/app/profile/photo",
    };
  }

  // 3. No skills
  const totalSkills =
    (profile.coreSkills?.length || 0) + (profile.skills?.length || 0);
  if (totalSkills === 0) {
    return {
      title: "افزودن اولین مهارت تخصصی",
      description: "مهارت‌ها بیشترین تأثیر را در پیدا شدن توسط کارفرماها دارند.",
      ctaLabel: "افزودن مهارت",
      href: "/app/profile/onboarding/step-2-status",
    };
  }

  // 4. No work experience (beyond recent)
  if (!profile.experiences || profile.experiences.length === 0) {
    return {
      title: "افزودن سابقه کاری کامل",
      description: "افزودن جزئیات سابقه کاری به اعتبار پروفایل شما کمک می‌کند.",
      ctaLabel: "افزودن سابقه کاری",
      href: "/app/profile",
    };
  }

  // 5. No summary
  if (!profile.summary) {
    return {
      title: "نوشتن خلاصه حرفه‌ای",
      description: "یک خلاصه کوتاه کمک می‌کند کارفرما سریع‌تر شما را بشناسد.",
      ctaLabel: "نوشتن خلاصه",
      href: "/app/profile/onboarding/step-4-summary",
    };
  }

  // 6. No tests completed
  const hasAssessments =
    profile.personality?.quick ||
    profile.personality?.full ||
    profile.disc ||
    profile.holland;

  if (!hasAssessments) {
    return {
      title: "انجام آزمون سبک کاری",
      description: "آزمون‌ها به کارفرما کمک می‌کند سبک کاری شما را بهتر بشناسد.",
      ctaLabel: "شروع آزمون MBTI",
      href: "/app/personality/quick",
    };
  }

  // All done!
  return {
    title: "پروفایل شما کامل است!",
    description: "برای تقویت بیشتر، می‌توانید آزمون‌های تکمیلی را انجام دهید.",
    ctaLabel: "مشاهده آزمون‌ها",
    href: "/app/assessments",
  };
}

export default function DashboardNewPage() {
  const [profile, setProfile] = useState<FocusedProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = loadFocusedFromStorage();
    setProfile(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  const strength = profile ? calculateProfileStrength(profile) : { percentage: 0 };
  const nextAction = getNextBestAction(profile);
  const firstName = profile?.fullName?.split(" ")[0] || "کاربر";

  // Simple profile strength calculation (MVP)
  const calculateSimpleStrength = () => {
    if (!profile) return 0;

    let score = 0;

    // Basic info (20%)
    if (profile.fullName && profile.recentExperience?.role) score += 20;

    // Photo (10%)
    if (profile.photoUrl) score += 10;

    // Skills (25%)
    const totalSkills = (profile.coreSkills?.length || 0) + (profile.skills?.length || 0);
    if (totalSkills > 0) score += 25;

    // Experience (25%)
    if (profile.experiences && profile.experiences.length > 0) score += 25;

    // Summary (10%)
    if (profile.summary) score += 10;

    // Tests (10%)
    const hasAssessments =
      profile.personality?.quick ||
      profile.personality?.full ||
      profile.disc ||
      profile.holland;
    if (hasAssessments) score += 10;

    return score;
  };

  const simpleStrength = calculateSimpleStrength();

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6">
      {/* 1️⃣ Header (Passive) */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">
          خوش آمدید، {firstName}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          پروفایل حرفه‌ای شما در حال آماده‌سازی است
        </p>
      </div>

      {/* 2️⃣ Hero Card — Profile Strength (PRIMARY FOCUS) */}
      <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Circular Progress or Big Number */}
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${simpleStrength * 2.83} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl md:text-5xl font-bold text-blue-600">
                  {simpleStrength}٪
                </span>
              </div>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold">
                {simpleStrength === 0
                  ? "پروفایل حرفه‌ای شما هنوز شروع نشده"
                  : simpleStrength < 60
                  ? "پروفایل شما در حال تکمیل است"
                  : "پروفایل شما آماده است"}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                {simpleStrength === 0
                  ? "کارفرماها ابتدا پروفایل‌های کامل را می‌بینند"
                  : "هرچه این عدد بالاتر باشد، شانس دیده‌شدن شما بیشتر می‌شود"}
              </p>
            </div>

            {/* ONE Primary CTA */}
            {simpleStrength < 100 && (
              <Button asChild size="lg" className="text-base px-8">
                <Link href={nextAction.href}>
                  {simpleStrength === 0
                    ? "شروع ساخت پروفایل حرفه‌ای"
                    : "افزایش قدرت پروفایل"}
                  <span className="mr-2 text-sm text-blue-100">
                    (۵ دقیقه)
                  </span>
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✨ Promise Card (Only in Zero State) */}
      {simpleStrength === 0 && (
        <Card className="shadow-md border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-center">
                در کاربرگ چه چیزی به دست می‌آورید؟
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    پروفایل حرفه‌ای مخصوص صنعت مالی
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    رزومه آماده ارسال برای کارفرما
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    تطبیق هوشمند با نیازمندی‌ها
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    نمایش سبک کاری و مهارت‌ها
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-center text-muted-foreground">
                  کاربرگ مخصوص متخصصان مالی، حسابداری، بورس و بیمه است
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3️⃣ Next Best Action Card (Dynamic) */}
      {simpleStrength < 100 && (
        <Card className="shadow-md border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    {simpleStrength === 0
                      ? "اولین قدم برای دیده‌شدن"
                      : "پیشنهاد بعدی برای شما"}
                  </p>
                  <h3 className="text-lg font-bold mb-1">{nextAction.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {nextAction.description}
                  </p>
                </div>
              </div>

              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href={nextAction.href}>
                  {nextAction.ctaLabel}
                  <span className="mr-2 text-sm text-purple-100">(کمتر از ۲ دقیقه)</span>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4️⃣ Passive KPI Cards (No CTA) - Only show if profile has some progress */}
      {simpleStrength > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* آمادگی برای نیازمندی‌ها */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  آمادگی برای نیازمندی‌ها
                </p>
                {simpleStrength >= 60 ? (
                  <>
                    <p className="text-2xl font-bold text-green-600">آماده</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      پروفایل شما قابل دیدن است
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-400">غیرفعال</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      پس از تکمیل پروفایل فعال می‌شود
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* میزان دیده‌شدن */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  میزان دیده‌شدن
                </p>
                <p className="text-2xl font-bold text-gray-400">—</p>
                <p className="text-xs text-muted-foreground mt-1">
                  پس از تکمیل پروفایل فعال می‌شود
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* آزمون‌های حرفه‌ای */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  آزمون‌های حرفه‌ای
                </p>
                {profile?.personality?.quick || profile?.personality?.full || profile?.disc || profile?.holland ? (
                  <>
                    <p className="text-2xl font-bold text-purple-600">تکمیل شده</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      آزمون‌ها انجام شده‌اند
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-400">۰ آزمون</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      هنوز آزمونی انجام نشده
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* 6️⃣ Quick Access Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-base">پروفایل عمومی</h3>
              <p className="text-sm text-muted-foreground">
                مشاهده پروفایلی که کارفرماها می‌بینند
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full"
                disabled={simpleStrength < 60}
              >
                <Link href={profile?.slug ? `/u/${profile.slug}` : "#"}>
                  مشاهده پروفایل
                </Link>
              </Button>
              {simpleStrength < 60 && (
                <p className="text-xs text-center text-muted-foreground">
                  بعد از تکمیل پروفایل فعال می‌شود
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-base">رزومه حرفه‌ای</h3>
              <p className="text-sm text-muted-foreground">
                رزومه ساخته‌شده از اطلاعات پروفایل
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full"
                disabled={simpleStrength < 60}
              >
                <Link href="/app/resume">
                  مشاهده و دانلود رزومه
                </Link>
              </Button>
              {simpleStrength < 60 && (
                <p className="text-xs text-center text-muted-foreground">
                  بعد از تکمیل پروفایل فعال می‌شود
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7️⃣ Footer Trust Note */}
      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-center text-blue-900 leading-relaxed">
            اطلاعات شما محرمانه است و فقط در صورت اجازه شما برای کارفرماها نمایش داده می‌شود.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
