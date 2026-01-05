"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  loadFromStorage,
  isOnboardingComplete,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  type OnboardingProfile,
} from "@/lib/onboarding";

export default function ProfilePage() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Load onboarding data from localStorage
    const data = loadFromStorage();
    const isComplete = isOnboardingComplete();
    setProfile(data);
    setCompleted(isComplete);
  }, []);

  if (!profile) {
    return <div className="space-y-6">در حال بارگذاری...</div>;
  }

  const experienceLabel = EXPERIENCE_LEVELS.find((e) => e.value === profile.experienceLevel)?.label;
  const jobStatusLabel = JOB_STATUSES.find((s) => s.value === profile.jobStatus)?.label;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">پروفایل من</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            مشاهده و مدیریت اطلاعات حرفه‌ای شما
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="text-xs md:text-sm">
            <Link href="/app/profile/onboarding">
              {completed ? "ویرایش آنبوردینگ" : "تکمیل آنبوردینگ"}
            </Link>
          </Button>
          <Button asChild className="text-xs md:text-sm">
            <Link href="/app/profile/edit">ویرایش پروفایل</Link>
          </Button>
        </div>
      </div>

      {/* Completion Status */}
      {!completed && profile.fullName && (
        <Card className="border-primary/50 bg-primary/5 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm leading-relaxed">
              ⚠️ پروفایل شما هنوز کامل نیست. برای افزایش شانس دیده‌شدن توسط کارفرمایان،{" "}
              <Link href="/app/profile/onboarding" className="underline font-medium text-primary hover:text-primary/80">
                تکمیل پروفایل را ادامه دهید
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Profile Preview */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">اطلاعات پایه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs md:text-sm text-muted-foreground">نام و نام خانوادگی</label>
            <p className="text-sm md:text-base font-medium">{profile.fullName || "—"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs md:text-sm text-muted-foreground">شهر</label>
            <p className="text-sm md:text-base font-medium">{profile.city || "—"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs md:text-sm text-muted-foreground">سطح تجربه</label>
            <p className="text-sm md:text-base font-medium">{experienceLabel || "—"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs md:text-sm text-muted-foreground">وضعیت شغلی</label>
            <p className="text-sm md:text-base font-medium">{jobStatusLabel || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">مهارت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs md:text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">
                هنوز مهارتی اضافه نکرده‌اید
              </p>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/app/profile/onboarding/step-3-skills">افزودن مهارت</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {profile.summary && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-lg md:text-xl">خلاصه حرفه‌ای</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm leading-relaxed">{profile.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Resume */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">رزومه</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-3">
            رزومه شما به صورت خودکار از اطلاعات پروفایل ساخته می‌شود و قابل دانلود است.
          </p>
          <Button asChild variant="outline" size="sm" className="text-xs md:text-sm">
            <Link href="/app/resume">مشاهده و دانلود رزومه</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Public Profile Link */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">اشتراک‌گذاری پروفایل</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
            با استفاده از این لینک، پروفایل حرفه‌ای خود را با کارفرمایان به اشتراک بگذارید
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 px-3 py-2 bg-secondary rounded text-xs md:text-sm overflow-x-auto" dir="ltr">
              https://karbarg.ir/u/{profile.fullName ? profile.fullName.toLowerCase().replace(/\s+/g, '-') : 'username'}
            </code>
            <Button variant="outline" size="sm" className="text-xs md:text-sm whitespace-nowrap">
              کپی لینک
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trust Message */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-center font-medium leading-relaxed">
            اطلاعات شما محرمانه است و تنها زمانی که شما اجازه دهید برای کارفرمایان نمایش داده می‌شود.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
