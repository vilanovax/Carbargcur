"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import { CheckCircle2, Circle, FileText } from "lucide-react";
import Link from "next/link";
import { loadFromStorage, type OnboardingProfile } from "@/lib/onboarding";
import {
  getProfileCompletion,
  canDownloadResume,
} from "@/lib/profileCompletion";
import ProfileCompletionGuard from "@/components/profile/ProfileCompletionGuard";

export default function ResumePage() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    // TODO: در آینده از API دریافت شود
    const data = loadFromStorage();
    setProfile(data);
  }, []);

  const completion = getProfileCompletion(profile);
  const hasCompleteProfile = canDownloadResume(profile);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">رزومه حرفه‌ای</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            رزومه شما به صورت خودکار از پروفایل ساخته می‌شود
          </p>
        </div>
        <Button
          asChild
          disabled={!hasCompleteProfile}
          className="text-xs md:text-sm whitespace-nowrap"
          title={!hasCompleteProfile ? "رزومه پس از تکمیل پروفایل فعال می‌شود" : undefined}
        >
          <Link href="/app/resume/preview">
            <FileText className="w-4 h-4 ml-2" />
            مشاهده پیش‌نمایش
          </Link>
        </Button>
      </div>

      {hasCompleteProfile ? (
        <Card className="shadow-sm">
          <CardContent className="p-6 md:p-8">
            {/* TODO: نمایش پیش‌نمایش رزومه */}
            <div className="border-2 border-dashed rounded-lg p-8 md:p-12 text-center">
              <p className="text-xs md:text-sm text-muted-foreground">
                پیش‌نمایش رزومه اینجا نمایش داده می‌شود
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ProfileCompletionGuard completion={completion} variant="minimal" />
      )}

      {/* Trust Message */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-center font-medium leading-relaxed">
            رزومه شما تنها زمانی برای کارفرمایان قابل مشاهده است که خودتان آن را ارسال کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
