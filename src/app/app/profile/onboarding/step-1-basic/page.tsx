"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingNav from "@/components/onboarding/OnboardingNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  OnboardingProfile,
  ExperienceLevel,
  loadFromStorage,
  saveToStorage,
  validateStep,
  EXPERIENCE_LEVELS,
} from "@/lib/onboarding";

export default function Step1BasicPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFromStorage();
    setProfile(loaded);
  }, []);

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
    const validation = validateStep("step-1", profile);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    router.push("/app/profile/onboarding/step-2-status");
  };

  const handleChange = (field: keyof OnboardingProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <OnboardingShell
      currentStep={1}
      title="اطلاعات پایه"
      description="این اطلاعات کمک می‌کند پروفایل شما دقیق‌تر نمایش داده شود."
    >
      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">نام و نام خانوادگی</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="مثال: علی رضایی"
            value={profile.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">شهر محل فعالیت</Label>
          <Input
            id="city"
            type="text"
            placeholder="مثال: تهران"
            value={profile.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label>سطح تجربه</Label>
          <RadioGroup
            value={profile.experienceLevel}
            onValueChange={(value) => handleChange("experienceLevel", value as ExperienceLevel)}
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center gap-2">
                <RadioGroupItem value={level.value} id={level.value} />
                <Label htmlFor={level.value} className="font-normal cursor-pointer">
                  {level.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.experienceLevel && (
            <p className="text-sm text-destructive">{errors.experienceLevel}</p>
          )}
        </div>

        {/* Navigation */}
        <OnboardingNav
          onNext={handleNext}
          nextLabel="ادامه"
          showBack={false}
        />
      </div>
    </OnboardingShell>
  );
}
