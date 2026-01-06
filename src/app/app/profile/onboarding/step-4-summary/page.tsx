"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingNav from "@/components/onboarding/OnboardingNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import {
  type FocusedProfile,
  type DegreeLevel,
  loadFocusedFromStorage,
  saveFocusedToStorage,
  validateFocusedStep,
  getFirstIncompleteStep,
  DEGREE_OPTIONS,
} from "@/lib/onboarding";
import { trackProfileUpdate } from "@/lib/profileStrength";

export default function Step4EducationPage() {
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
    if (!step1Valid.ok || !step2Valid.ok || !step3Valid.ok) {
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
    const validation = validateFocusedStep("step-4", profile);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    router.push("/app/profile/onboarding/step-5-certifications");
  };

  const handleBack = () => {
    router.push("/app/profile/onboarding/step-3-skills");
  };

  const handleEducationChange = (field: string, value: string) => {
    setProfile({
      ...profile,
      latestEducation: {
        ...profile.latestEducation,
        [field]: value,
      } as any,
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const education = profile.latestEducation || {};

  return (
    <OnboardingShell
      currentStep={4}
      title="آخرین مدرک تحصیلی"
      description="آخرین مدرک تحصیلی شما چیست؟"
    >
      <div className="space-y-6">
        {/* Helper Box */}
        <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <GraduationCap className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <p className="text-sm text-purple-800 leading-relaxed">
            جزئیات بیشتر در رزومه قابل اضافه شدن است.
          </p>
        </div>

        {/* Degree Level */}
        <div className="space-y-2">
          <Label htmlFor="degree">
            مقطع تحصیلی <span className="text-red-500">*</span>
          </Label>
          <Select
            value={education.degree}
            onValueChange={(value) => handleEducationChange("degree", value)}
          >
            <SelectTrigger className={errors.degree ? "border-red-500" : ""}>
              <SelectValue placeholder="انتخاب کنید" />
            </SelectTrigger>
            <SelectContent>
              {DEGREE_OPTIONS.map((degree) => (
                <SelectItem key={degree.value} value={degree.value}>
                  {degree.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.degree && (
            <p className="text-sm text-red-600">{errors.degree}</p>
          )}
        </div>

        {/* Field of Study */}
        <div className="space-y-2">
          <Label htmlFor="field">
            رشته تحصیلی <span className="text-red-500">*</span>
          </Label>
          <Input
            id="field"
            type="text"
            placeholder="مثال: حسابداری، مدیریت مالی، اقتصاد"
            value={education.field || ""}
            onChange={(e) => handleEducationChange("field", e.target.value)}
          />
          {errors.field && (
            <p className="text-sm text-red-600">{errors.field}</p>
          )}
        </div>

        {/* University (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="university" className="text-muted-foreground">
            نام دانشگاه (اختیاری)
          </Label>
          <Input
            id="university"
            type="text"
            placeholder="مثال: دانشگاه تهران"
            value={education.university || ""}
            onChange={(e) => handleEducationChange("university", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            اگر دانشگاه شما معتبر است، قید کردن آن می‌تواند مفید باشد
          </p>
        </div>

        {/* Profile Strength Impact */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            تکمیل این بخش +۱۰٪ به قدرت پروفایل شما اضافه می‌کند
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
