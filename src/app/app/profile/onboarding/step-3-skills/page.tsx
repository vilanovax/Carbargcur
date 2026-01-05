"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingNav from "@/components/onboarding/OnboardingNav";
import SkillSelector from "@/components/onboarding/SkillSelector";
import {
  OnboardingProfile,
  loadFromStorage,
  saveToStorage,
  validateStep,
  getFirstIncompleteStep,
} from "@/lib/onboarding";

export default function Step3SkillsPage() {
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
    if (!step1Valid.ok || !step2Valid.ok) {
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
    const validation = validateStep("step-3", profile);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    router.push("/app/profile/onboarding/step-4-summary");
  };

  const handleBack = () => {
    router.push("/app/profile/onboarding/step-2-status");
  };

  const handleSkillsChange = (skills: string[]) => {
    setProfile({ ...profile, skills });
    // Clear error
    if (errors.skills) {
      setErrors({});
    }
  };

  return (
    <OnboardingShell
      currentStep={3}
      title="مهارت‌ها و تخصص‌ها"
      description="مهارت‌هایی را انتخاب کنید که واقعاً در آن‌ها تجربه دارید. حداقل ۳ مورد."
    >
      <div className="space-y-6">
        {/* Skill Selector */}
        <SkillSelector
          skills={profile.skills}
          onChange={handleSkillsChange}
          error={errors.skills}
          maxSkills={10}
        />

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
