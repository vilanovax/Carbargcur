"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";
import { loadFromStorage, type OnboardingProfile } from "@/lib/onboarding";
import { getProfileCompletion } from "@/lib/profileCompletion";
import FullResultVisualization from "@/components/assessment/FullResultVisualization";

export default function DashboardPage() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    // TODO: در آینده از API دریافت شود
    const data = loadFromStorage();
    setProfile(data);
  }, []);

  const completion = getProfileCompletion(profile);

  // TODO: دریافت اطلاعات کاربر از API
  const mockUser = {
    name: profile?.fullName || "کاربر",
    profileCompletion: completion.percentage,
  };

  // Combine required and optional steps for display
  const allSteps = [
    ...completion.requiredSteps,
    ...completion.optionalSteps,
  ];

  const stepsRemaining = allSteps.filter((s) => !s.completed).length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">خوش آمدید، {mockUser.name}</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          پروفایل حرفه‌ای شما در حال تکمیل است
        </p>
        <p className="text-xs md:text-sm text-muted-foreground">
          از اینجا می‌توانید وضعیت پروفایل، رزومه و آزمون شخصیت خود را مدیریت کنید.
        </p>
      </div>

      {/* Profile Completion Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">تکمیل پروفایل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm md:text-base font-medium">
                پروفایل شما {mockUser.profileCompletion}٪ تکمیل شده
              </span>
              <span className="text-xs md:text-sm text-muted-foreground">
                {mockUser.profileCompletion}/100
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 md:h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${mockUser.profileCompletion}%` }}
              />
            </div>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            هرچه پروفایل شما کامل‌تر باشد، شانس دیده‌شدن توسط کارفرمایان بیشتر می‌شود.
          </p>

          {/* Remaining Steps */}
          {stepsRemaining > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-xs md:text-sm font-medium">مراحل باقی‌مانده:</p>
              <div className="space-y-2">
                {allSteps.map((step, index) => (
                  <Link
                    key={step.id}
                    href={step.actionHref}
                    className="flex items-center gap-2 md:gap-3 text-xs md:text-sm p-2 md:p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span
                      className={
                        step.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }
                    >
                      {step.title}
                      {step.required && !step.completed && (
                        <span className="text-destructive mr-1">*</span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 border-t">
            <Button asChild className="flex-1 text-xs md:text-sm">
              <Link href="/app/profile/onboarding">
                ادامه تکمیل پروفایل
                {stepsRemaining > 0 && ` (${stepsRemaining} مرحله باقی‌مانده)`}
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 text-xs md:text-sm">
              <Link href="/app/profile/edit">ویرایش پروفایل</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Assessment Results Visualization */}
      {profile?.personality?.full && (
        <FullResultVisualization result={profile.personality.full} />
      )}

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">آزمون سبک کاری</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 leading-relaxed">
              سبک کاری خود را با آزمون MBTI بشناسید.
            </p>
            <Button asChild variant="outline" className="w-full text-xs md:text-sm">
              <Link href="/app/personality">شروع آزمون (حدود ۳ دقیقه)</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-purple-200 bg-purple-50/30">
          <CardContent className="p-4 md:p-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">آزمون رفتار حرفه‌ای</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 leading-relaxed">
              رفتار کاری خود را با آزمون DISC بشناسید.
            </p>
            <Button asChild variant="outline" className="w-full text-xs md:text-sm border-purple-300 hover:bg-purple-100">
              <Link href="/app/assessments/disc">شروع آزمون (حدود ۴ دقیقه)</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">پیش‌نمایش رزومه</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 leading-relaxed">
              رزومه شما به‌صورت خودکار از اطلاعات پروفایل ساخته می‌شود.
            </p>
            <Button asChild variant="outline" className="w-full text-xs md:text-sm">
              <Link href="/app/resume">مشاهده رزومه</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trust Message */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-center font-medium leading-relaxed">
            شما کنترل کامل روی دیده‌شدن پروفایل خود دارید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
