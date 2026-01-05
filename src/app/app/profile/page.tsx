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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">پروفایل من</h1>
          <p className="text-muted-foreground">
            مشاهده و مدیریت اطلاعات پروفایل شما
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/app/profile/onboarding">
              {completed ? "ویرایش آنبوردینگ" : "تکمیل آنبوردینگ"}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/app/profile/edit">ویرایش پروفایل</Link>
          </Button>
        </div>
      </div>

      {/* Completion Status */}
      {!completed && profile.fullName && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm">
              ⚠️ آنبوردینگ شما هنوز نهایی نشده است.{" "}
              <Link href="/app/profile/onboarding" className="underline font-medium">
                ادامه دهید
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Profile Preview */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات پایه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">نام و نام خانوادگی</label>
            <p className="font-medium">{profile.fullName || "—"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">شهر</label>
            <p className="font-medium">{profile.city || "—"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">سطح تجربه</label>
            <p className="font-medium">{experienceLabel || "—"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">وضعیت شغلی</label>
            <p className="font-medium">{jobStatusLabel || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>مهارت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              هنوز مهارتی اضافه نکرده‌اید
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {profile.summary && (
        <Card>
          <CardHeader>
            <CardTitle>خلاصه حرفه‌ای</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{profile.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Resume */}
      <Card>
        <CardHeader>
          <CardTitle>رزومه</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            برای دریافت رزومه PDF، ابتدا پروفایل خود را کامل کنید.
          </p>
        </CardContent>
      </Card>

      {/* Public Profile Link */}
      <Card>
        <CardHeader>
          <CardTitle>لینک پروفایل عمومی</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            از این لینک برای اشتراک‌گذاری پروفایل خود استفاده کنید
          </p>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-2 bg-secondary rounded text-sm" dir="ltr">
              https://karbarg.ir/u/{profile.fullName ? profile.fullName.toLowerCase().replace(/\s+/g, '-') : 'username'}
            </code>
            <Button variant="outline" size="sm">
              کپی
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TODO Notice */}
      <Card className="bg-secondary/50">
        <CardContent className="p-6">
          <p className="text-sm text-center">
            <strong>توجه:</strong> داده‌های بالا از localStorage خوانده شده‌اند.
            در مراحل بعدی به backend متصل می‌شوند.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
