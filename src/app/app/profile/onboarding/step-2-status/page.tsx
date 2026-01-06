"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingNav from "@/components/onboarding/OnboardingNav";
import CoreSkillsSelector from "@/components/onboarding/CoreSkillsSelector";
import { Lightbulb } from "lucide-react";
import {
  type FocusedProfile,
  loadFocusedFromStorage,
  saveFocusedToStorage,
  validateFocusedStep,
  getFirstIncompleteStep,
} from "@/lib/onboarding";
import { trackProfileEvent } from "@/lib/profileEvents";

export default function Step2CoreSkillsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FocusedProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFocusedFromStorage();
    setProfile(loaded);

    // Validate step 1 - redirect if incomplete
    const step1Valid = validateFocusedStep("step-1", loaded);
    if (!step1Valid.ok) {
      router.push(getFirstIncompleteStep(loaded));
    }
  }, [router]);

  // Auto-save with debounce
  useEffect(() => {
    if (!profile) return;

    const timer = setTimeout(() => {
      saveFocusedToStorage(profile);
    }, 300);

    return () => clearTimeout(timer);
  }, [profile]);

  if (!profile) {
    return <div className="container max-w-2xl mx-auto px-4 py-8">در حال بارگذاری...</div>;
  }

  const handleNext = () => {
    const validation = validateFocusedStep("step-2", profile);

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

  const handleChange = (skills: string[]) => {
    const previousSkills = profile.coreSkills || [];
    const skillsAdded = skills.length > previousSkills.length;

    setProfile({ ...profile, coreSkills: skills });

    // Track event when skills are added (not when removed)
    if (skillsAdded && skills.length > 0) {
      trackProfileEvent("skill_added", {
        skillCount: skills.length,
        skills: skills,
      });
    }

    // Clear error
    if (errors.coreSkills) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.coreSkills;
        return next;
      });
    }
  };

  return (
    <OnboardingShell
      currentStep={2}
      title="مهارت‌های تخصصی کلیدی"
      description="قوی‌ترین مهارت‌های تخصصی شما کدام‌اند؟ (حداکثر ۲ مورد)"
    >
      <div className="space-y-6">
        {/* Helper Box */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm text-amber-900 font-medium leading-relaxed">
              انتخاب کمتر، دیده‌شدن بهتر
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              فقط قوی‌ترین مهارت‌های خود را انتخاب کنید. این کمک می‌کند پروفایل شما تخصصی‌تر به نظر برسد.
            </p>
          </div>
        </div>

        {/* Core Skills Selector */}
        <div className="space-y-2">
          <CoreSkillsSelector
            value={profile.coreSkills || []}
            onChange={handleChange}
            error={errors.coreSkills}
          />
        </div>

        {/* Profile Strength Impact */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            تکمیل این بخش +۲۰٪ به قدرت پروفایل شما اضافه می‌کند
          </p>
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
