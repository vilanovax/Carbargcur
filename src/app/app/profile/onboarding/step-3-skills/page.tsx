"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingNav from "@/components/onboarding/OnboardingNav";
import CareerFocusPicker from "@/components/onboarding/CareerFocusPicker";
import { Target } from "lucide-react";
import {
  type FocusedProfile,
  type CareerFocus,
  loadFocusedFromStorage,
  saveFocusedToStorage,
  validateFocusedStep,
  getFirstIncompleteStep,
} from "@/lib/onboarding";
import { trackProfileUpdate } from "@/lib/profileStrength";

export default function Step3CareerFocusPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FocusedProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFocusedFromStorage();
    setProfile(loaded);

    // Validate previous steps - redirect if incomplete
    const step1Valid = validateFocusedStep("step-1", loaded);
    const step2Valid = validateFocusedStep("step-2", loaded);
    if (!step1Valid.ok || !step2Valid.ok) {
      router.push(getFirstIncompleteStep(loaded));
    }
  }, [router]);

  // Auto-save with debounce
  useEffect(() => {
    if (!profile) return;

    const timer = setTimeout(() => {
      saveFocusedToStorage(profile);
      trackProfileUpdate(); // Track activity for profile strength
    }, 300);

    return () => clearTimeout(timer);
  }, [profile]);

  if (!profile) {
    return <div className="container max-w-2xl mx-auto px-4 py-8">در حال بارگذاری...</div>;
  }

  const handleNext = () => {
    const validation = validateFocusedStep("step-3", profile);

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

  const handleChange = (focus: CareerFocus) => {
    setProfile({ ...profile, careerFocus: focus });
    // Clear error
    if (errors.careerFocus) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.careerFocus;
        return next;
      });
    }
  };

  return (
    <OnboardingShell
      currentStep={3}
      title="تمرکز شغلی فعلی"
      description="در حال حاضر تمرکز اصلی شما روی چیست؟"
    >
      <div className="space-y-6">
        {/* Helper Box */}
        <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <Target className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm text-indigo-900 font-medium leading-relaxed">
              این انتخاب به پیشنهاد دقیق‌تر فرصت‌ها کمک می‌کند
            </p>
            <p className="text-xs text-indigo-700 leading-relaxed">
              صادقانه پاسخ دهید تا بهترین فرصت‌های شغلی را دریافت کنید.
            </p>
          </div>
        </div>

        {/* Career Focus Picker */}
        <CareerFocusPicker
          value={profile.careerFocus}
          onChange={handleChange}
          error={errors.careerFocus}
        />

        {/* Profile Strength Impact */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            تکمیل این بخش +۱۵٪ به قدرت پروفایل شما اضافه می‌کند
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
