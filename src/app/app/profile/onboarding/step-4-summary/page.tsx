"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingNav from "@/components/onboarding/OnboardingNav";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  OnboardingProfile,
  loadFromStorage,
  saveToStorage,
  validateStep,
  getFirstIncompleteStep,
} from "@/lib/onboarding";

const MAX_SUMMARY_LENGTH = 300;

export default function Step4SummaryPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFromStorage();
    setProfile(loaded);

    // Validate previous steps - redirect if incomplete
    const step1Valid = validateStep("step-1", loaded);
    const step2Valid = validateStep("step-2", loaded);
    const step3Valid = validateStep("step-3", loaded);
    if (!step1Valid.ok || !step2Valid.ok || !step3Valid.ok) {
      router.push(getFirstIncompleteStep(loaded));
    }
  }, [router]);

  // Auto-save with debounce
  useEffect(() => {
    if (!profile) return;

    const timer = setTimeout(() => {
      saveToStorage(profile);
    }, 300);

    return () => clearTimeout(timer);
  }, [profile]);

  if (!profile) {
    return <div className="container max-w-2xl mx-auto px-4 py-8">در حال بارگذاری...</div>;
  }

  const handleNext = () => {
    const validation = validateStep("step-4", profile);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    router.push("/app/profile/onboarding/review");
  };

  const handleBack = () => {
    router.push("/app/profile/onboarding/step-3-skills");
  };

  const handleChange = (value: string) => {
    setProfile({ ...profile, summary: value });
    // Clear error
    if (errors.summary) {
      setErrors({});
    }
  };

  const remainingChars = MAX_SUMMARY_LENGTH - profile.summary.length;

  return (
    <OnboardingShell
      currentStep={4}
      title="خلاصه حرفه‌ای (اختیاری)"
      description="در ۱–۲ جمله بگویید در چه حوزه‌ای تخصص دارید و دنبال چه نوع فرصتی هستید."
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="summary">خلاصه حرفه‌ای</Label>
            <span
              className={`text-xs ${
                remainingChars < 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              مانده: {remainingChars}
            </span>
          </div>
          <Textarea
            id="summary"
            placeholder="مثال: تحلیلگر مالی با ۵ سال تجربه در ارزش‌گذاری و مدل‌سازی مالی. آماده همکاری تمام‌وقت یا پروژه‌ای."
            value={profile.summary}
            onChange={(e) => handleChange(e.target.value)}
            rows={5}
            maxLength={MAX_SUMMARY_LENGTH}
          />
          {errors.summary && (
            <p className="text-sm text-destructive">{errors.summary}</p>
          )}
          <p className="text-xs text-muted-foreground">
            این بخش اختیاری است و می‌توانید آن را خالی بگذارید.
          </p>
        </div>

        {/* Navigation */}
        <OnboardingNav
          onBack={handleBack}
          onNext={handleNext}
          backLabel="مرحله قبل"
          nextLabel="بازبینی"
        />
      </div>
    </OnboardingShell>
  );
}
