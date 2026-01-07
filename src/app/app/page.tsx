"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Target, Brain } from "lucide-react";
import {
  type FocusedProfile,
  loadFocusedFromStorage,
} from "@/lib/onboarding";

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

  // 1. No basic info (check for recent experience which is the new required field)
  if (!profile.recentExperience?.role) {
    return {
      title: "تکمیل اطلاعات پایه",
      description: "نام و سابقه کاری اخیر شما برای فعال شدن پروفایل لازم است.",
      ctaLabel: "تکمیل اطلاعات پایه (کمتر از ۲ دقیقه)",
      href: "/app/profile/onboarding/step-1-basic",
    };
  }

  // 2. No profile photo
  if (!profile.profilePhotoUrl) {
    return {
      title: "افزودن عکس پروفایل",
      description: "پروفایل‌های با عکس تا ۳ برابر بیشتر دیده می‌شوند.",
      ctaLabel: "آپلود عکس",
      href: "/app/profile/photo",
    };
  }

  // 3. No skills
  if (!profile.coreSkills || profile.coreSkills.length === 0) {
    return {
      title: "افزودن اولین مهارت تخصصی",
      description: "مهارت‌ها بیشترین تأثیر را در پیدا شدن توسط کارفرماها دارند.",
      ctaLabel: "افزودن مهارت",
      href: "/app/profile/onboarding/step-2-status",
    };
  }

  // 4. No career focus
  if (!profile.careerFocus) {
    return {
      title: "تعیین تمرکز شغلی",
      description: "تمرکز شغلی شما به ما کمک می‌کند فرصت‌های مناسب را پیدا کنیم.",
      ctaLabel: "انتخاب تمرکز شغلی",
      href: "/app/profile/onboarding/step-3-skills",
    };
  }

  // 5. No education
  if (!profile.latestEducation?.degree) {
    return {
      title: "افزودن مدرک تحصیلی",
      description: "مدرک تحصیلی به تکمیل پروفایل شما کمک می‌کند.",
      ctaLabel: "افزودن مدرک",
      href: "/app/profile/onboarding/step-4-summary",
    };
  }

  // 6. No certifications
  if (!profile.certifications || profile.certifications.length === 0) {
    return {
      title: "افزودن گواهی‌نامه‌ها",
      description: "گواهی‌نامه‌ها اعتبار حرفه‌ای شما را افزایش می‌دهند.",
      ctaLabel: "افزودن گواهی‌نامه",
      href: "/app/profile/onboarding/step-5-certifications",
    };
  }

  // 7. No tests completed
  const hasAssessments =
    profile.assessments?.disc || profile.assessments?.holland;

  if (!hasAssessments) {
    return {
      title: "انجام آزمون سبک کاری",
      description: "آزمون‌ها به کارفرما کمک می‌کند سبک کاری شما را بهتر بشناسد.",
      ctaLabel: "شروع آزمون DISC",
      href: "/app/assessments/disc",
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

export default function DashboardPage() {
  const [profile, setProfile] = useState<FocusedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setMounted(true);
      const data = loadFocusedFromStorage();
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized calculations - prevent recalculation on every render
  const nextAction = useMemo(() => getNextBestAction(profile), [profile]);

  const simpleStrength = useMemo(() => {
    if (!profile) return 0;

    let score = 0;

    // Basic info: Recent Experience (15%)
    if (profile.recentExperience?.role && profile.recentExperience?.domain) score += 15;

    // Career Focus (10%)
    if (profile.careerFocus) score += 10;

    // Education (10%)
    if (profile.latestEducation?.degree && profile.latestEducation?.field) score += 10;

    // Photo (10%)
    if (profile.profilePhotoUrl) score += 10;

    // Core Skills (20%)
    if (profile.coreSkills && profile.coreSkills.length >= 1) score += 10;
    if (profile.coreSkills && profile.coreSkills.length >= 2) score += 5;
    if (profile.coreSkills && profile.coreSkills.length >= 3) score += 5;

    // Certifications (10%)
    if (profile.certifications && profile.certifications.length > 0) score += 10;

    // Assessments (15%)
    if (profile.assessments?.disc) score += 7;
    if (profile.assessments?.holland) score += 8;

    // Resume or Slug (10%)
    if (profile.resumeUrl || profile.slug) score += 10;

    return score;
  }, [profile]);

  const firstName = useMemo(() => profile?.fullName?.split(" ")[0] || "کاربر", [profile?.fullName]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6">
      {/* 1️⃣ Header (Passive) */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">
          {simpleStrength === 0 ? "پروفایل حرفه‌ای شما، فقط در چند دقیقه" : "خوش آمدید 👋"}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {simpleStrength === 0
            ? "این اطلاعات به ما کمک می‌کند شما را دقیق‌تر به فرصت‌های مناسب معرفی کنیم."
            : "پروفایل حرفه‌ای شما در حال آماده‌سازی است"}
        </p>
        {simpleStrength === 0 && (
          <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
            <span>🔒</span>
            اطلاعات شما فقط با اجازه شما نمایش داده می‌شود.
          </p>
        )}
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
                قدرت پروفایل شما
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                {simpleStrength === 0
                  ? "۰٪ — هنوز شروع نشده"
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

      {/* ✨ Value Card (Only in Zero State) */}
      {simpleStrength === 0 && (
        <Card className="shadow-md border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-center">
                با ساخت پروفایل در کاربرگ
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✔</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    پروفایل تخصصی مخصوص صنعت مالی
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✔</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    رزومه آماده ارسال
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✔</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    تطبیق هوشمند با نیازمندی‌ها
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✔</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    نمایش سبک کاری و مهارت‌ها
                  </p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground pt-2">
                کاربرگ مخصوص متخصصان مالی، حسابداری، بورس و بیمه است.
              </p>
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
                  <p className="text-xs font-medium text-purple-600 mb-1">
                    پیشنهاد بعدی برای شما
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

      {/* 4️⃣ Feature Cards (Zero State) */}
      {simpleStrength === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* آزمون‌های حرفه‌ای */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">آزمون‌های حرفه‌ای</h4>
                  <p className="text-xs text-muted-foreground">
                    شناخت سبک کاری و شخصیت شغلی
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* میزان دیده‌شدن */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">میزان دیده‌شدن</h4>
                  <p className="text-xs text-muted-foreground">
                    تعداد کارفرماهایی که شما را دیدند
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* آمادگی برای نیازمندی‌ها */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">آمادگی برای نیازمندی‌ها</h4>
                  <p className="text-xs text-muted-foreground">
                    پروفایل شما برای کدام آگهی‌ها مناسب است
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
                {profile?.assessments?.disc || profile?.assessments?.holland ? (
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

      {/* 5️⃣ Action Cards - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-base">رزومه حرفه‌ای شما</h3>
              <p className="text-sm text-muted-foreground">
                {simpleStrength === 0
                  ? "پس از تکمیل پروفایل، رزومه آماده دریافت می‌کنید"
                  : "رزومه ساخته‌شده از اطلاعات پروفایل"}
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full"
                disabled={simpleStrength < 60}
              >
                <Link href="/app/resume">
                  {simpleStrength < 60 ? "هنوز آماده نیست" : "مشاهده و دانلود رزومه"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-base">پروفایل عمومی شما</h3>
              <p className="text-sm text-muted-foreground">
                {simpleStrength === 0
                  ? "کارفرماها این پروفایل را می‌بینند"
                  : "مشاهده پروفایلی که کارفرماها می‌بینند"}
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full"
                disabled={simpleStrength < 60}
              >
                <Link href={profile?.slug ? `/u/${profile.slug}` : "#"}>
                  {simpleStrength < 60 ? "هنوز فعال نیست" : "مشاهده پروفایل"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6️⃣ Footer Trust Note */}
      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-center text-blue-900 leading-relaxed">
            🔒 اطلاعات شما محرمانه است و فقط با اجازه شما برای کارفرماها نمایش داده می‌شود
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
