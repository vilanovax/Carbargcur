"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingNav from "@/components/onboarding/OnboardingNav";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  OnboardingProfile,
  JobStatus,
  loadFromStorage,
  saveToStorage,
  validateStep,
  getFirstIncompleteStep,
  JOB_STATUSES,
} from "@/lib/onboarding";

export default function Step2StatusPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFromStorage();
    setProfile(loaded);

    // Validate step 1 - redirect if incomplete
    const step1Valid = validateStep("step-1", loaded);
    if (!step1Valid.ok) {
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
    const validation = validateStep("step-2", profile);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    router.push("/app/profile/onboarding/step-3-skills");
  };

  const handleBack = () => {
    router.push("/app/profile/onboarding/step-1-basic");
  };

  const handleChange = (value: string) => {
    setProfile({ ...profile, jobStatus: value as JobStatus });
    // Clear error
    if (errors.jobStatus) {
      setErrors({});
    }
  };

  return (
    <OnboardingShell
      currentStep={2}
      title="وضعیت شغلی فعلی"
      description="برای پیشنهادهای دقیق‌تر و نمایش بهتر در جستجو استفاده می‌شود."
    >
      <div className="space-y-6">
        {/* Job Status */}
        <div className="space-y-4">
          <RadioGroup value={profile.jobStatus} onValueChange={handleChange}>
            {JOB_STATUSES.map((status) => (
              <div
                key={status.value}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <RadioGroupItem value={status.value} id={status.value} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 text-right">
                  <Label htmlFor={status.value} className="font-medium cursor-pointer block">
                    {status.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {status.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {errors.jobStatus && (
            <p className="text-sm text-destructive">{errors.jobStatus}</p>
          )}
        </div>

        {/* Navigation */}
        <OnboardingNav
          onBack={handleBack}
          onNext={handleNext}
          backLabel="مرحله قبل"
          nextLabel="ادامه"
        />
      </div>
    </OnboardingShell>
  );
}
