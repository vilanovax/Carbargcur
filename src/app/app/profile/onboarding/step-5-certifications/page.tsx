"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingNav from "@/components/onboarding/OnboardingNav";
import CertificationRepeater from "@/components/onboarding/CertificationRepeater";
import { Button } from "@/components/ui/button";
import { Award, SkipForward } from "lucide-react";
import {
  type FocusedProfile,
  type Certification,
  loadFocusedFromStorage,
  saveFocusedToStorage,
  validateFocusedStep,
  getFirstIncompleteStep,
} from "@/lib/onboarding";
import { trackProfileUpdate } from "@/lib/profileStrength";

export default function Step5CertificationsPage() {
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
    const step3Valid = validateFocusedStep("step-3", loaded);
    const step4Valid = validateFocusedStep("step-4", loaded);
    if (!step1Valid.ok || !step2Valid.ok || !step3Valid.ok || !step4Valid.ok) {
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
    // Filter out empty certifications (where name is empty)
    const validCerts = (profile.certifications || []).filter(
      (cert) => cert.name && cert.name.trim() !== ""
    );

    // Update profile with only valid certifications
    const updatedProfile = {
      ...profile,
      certifications: validCerts.length > 0 ? validCerts : undefined,
    };

    saveFocusedToStorage(updatedProfile);
    router.push("/app/profile/onboarding/review");
  };

  const handleSkip = () => {
    // Remove certifications and proceed
    const updatedProfile = {
      ...profile,
      certifications: undefined,
    };
    saveFocusedToStorage(updatedProfile);
    router.push("/app/profile/onboarding/review");
  };

  const handleBack = () => {
    router.push("/app/profile/onboarding/step-4-summary");
  };

  const handleChange = (certifications: Certification[]) => {
    setProfile({ ...profile, certifications });
    // Clear error
    if (errors.certifications) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.certifications;
        return next;
      });
    }
  };

  const hasCertifications = profile.certifications && profile.certifications.length > 0;

  return (
    <OnboardingShell
      currentStep={5}
      title="دوره‌ها و گواهی‌ها"
      description="مهم‌ترین دوره‌ها یا گواهی‌های حرفه‌ای که گذرانده‌اید"
    >
      <div className="space-y-6">
        {/* Helper Box */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Award className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm text-blue-900 font-medium leading-relaxed">
              این بخش برای بسیاری از نقش‌های مالی بسیار تعیین‌کننده است
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              گواهی‌نامه‌های معتبر مثل CPA، CFA، ACCA یا دوره‌های تخصصی حسابداری و مالی را اضافه کنید.
            </p>
          </div>
        </div>

        {/* Certification Repeater */}
        <CertificationRepeater
          value={profile.certifications || []}
          onChange={handleChange}
          error={errors.certifications}
        />

        {/* Profile Strength Impact */}
        {hasCertifications && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              تکمیل این بخش +۱۰٪ به قدرت پروفایل شما اضافه می‌کند
            </p>
          </div>
        )}

        {/* Skip Option */}
        {!hasCertifications && (
          <div className="flex items-center justify-center py-4">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4 ml-2" />
              هیچ‌کدام (رد کردن این مرحله)
            </Button>
          </div>
        )}

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
