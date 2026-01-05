"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import {
  OnboardingProfile,
  loadFromStorage,
  validateStep,
  getFirstIncompleteStep,
  markOnboardingComplete,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
} from "@/lib/onboarding";

export default function ReviewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFromStorage();
    setProfile(loaded);

    // Validate all steps - redirect if any incomplete
    const reviewValidation = validateStep("review", loaded);
    if (!reviewValidation.ok) {
      router.push(getFirstIncompleteStep(loaded));
    }
  }, [router]);

  if (!profile) {
    return <div className="container max-w-2xl mx-auto px-4 py-8">در حال بارگذاری...</div>;
  }

  const handleFinish = () => {
    // Mark onboarding as complete
    markOnboardingComplete();

    // TODO: In future, send data to backend API here
    console.log("Onboarding complete! Profile data:", profile);

    // Redirect to profile page
    router.push("/app/profile");
  };

  const experienceLabel = EXPERIENCE_LEVELS.find((e) => e.value === profile.experienceLevel)?.label;
  const jobStatusLabel = JOB_STATUSES.find((s) => s.value === profile.jobStatus)?.label;

  return (
    <OnboardingShell
      currentStep={5}
      title="بازبینی پروفایل"
      description="قبل از نهایی‌کردن، یک‌بار اطلاعات را مرور کنید."
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">اطلاعات پایه</h3>
              <Link href="/app/profile/onboarding/step-1-basic">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <Pencil className="w-3 h-3" />
                  ویرایش
                </Button>
              </Link>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">نام: </span>
                <span className="font-medium">{profile.fullName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">شهر: </span>
                <span>{profile.city}</span>
              </div>
              <div>
                <span className="text-muted-foreground">سطح تجربه: </span>
                <span>{experienceLabel}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">وضعیت شغلی</h3>
              <Link href="/app/profile/onboarding/step-2-status">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <Pencil className="w-3 h-3" />
                  ویرایش
                </Button>
              </Link>
            </div>
            <div className="text-sm">
              <span className="font-medium">{jobStatusLabel}</span>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">مهارت‌ها</h3>
              <Link href="/app/profile/onboarding/step-3-skills">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <Pencil className="w-3 h-3" />
                  ویرایش
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">خلاصه حرفه‌ای</h3>
              <Link href="/app/profile/onboarding/step-4-summary">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <Pencil className="w-3 h-3" />
                  ویرایش
                </Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              {profile.summary || "خالی"}
            </div>
          </CardContent>
        </Card>

        {/* Finish Button */}
        <div className="pt-4">
          <Button onClick={handleFinish} size="lg" className="w-full">
            نهایی‌سازی و ساخت پروفایل
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
